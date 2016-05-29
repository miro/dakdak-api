// # eloController
//      everything related to elo-values on Images.
//
//      This module handles the business logic of calculating ELO-ratings
//

// The Elo rating system is a method for calculating the relative skill levels of players in
// two-player games such as chess. It is named after its creator Arpad Elo, a Hungarian-born American
// physics professor.
//
// The heart of the Elo ranking is the "Win Expectancy" expressed as a probability that one player
// will beat another based on the difference between their rankings. The Win Expectancy is defined as:
//
//           We = 1/(10^(-D/F) + 1)
//
// Where D equals the difference between the two players' ratings and F is the "rating interval
// scale weight factor". Bonzini set the ranking interval sizes to 500 and the weight factor to 1000.
//
// In the Bonzini system, if you win your rating goes up by an interval constant times the We.
// The loser's rating goes down by an equal amount. The Elo system is a zero sum system. The only way
// to add points to the league is to add more players.
'use strict';
var log                 = require('../log');

const ELO_STARTUP_POINTS = 1000;
const ELO_WEIGHT_FACTOR = 1000;

var controller = {};


function calculateMatchupReward(pointsOne, pointsTwo) {

    // Set points to default points, if they aren't set
    pointsOne = pointsOne || ELO_STARTUP_POINTS;
    pointsTwo = pointsTwo || ELO_STARTUP_POINTS;

    log.debug(`Calculating matchup reward for ${pointsOne} vs ${pointsTwo}`);

    const pointDifference = Math.abs(pointsOne - pointsTwo);

    // We = 1/(10^(-D/F) + 1)
    let expectancy = 1 / (Math.pow(10, -pointDifference / ELO_WEIGHT_FACTOR) + 1);

    // take the ceiling of the result so we don't have to play with floats.
    // (this might or might not mess up the rating system. Will see lol!)
    expectancy = Math.ceil(expectancy);


    log.debug(`Calculated reward: ${expectancy}`);

    return expectancy;
}

controller.calculateNewRatings = function calculateNewRatings(winnerPoints, loserPoints) {
    if (!winnerPoints) {
        log.debug('No points given for winner yet, defaulting to startup points');
        winnerPoints = ELO_STARTUP_POINTS;
    }
    if (!loserPoints) {
        log.debug('No points given for loser yet, defaulting to startup points');
        loserPoints = ELO_STARTUP_POINTS;
    }

    const reward = calculateMatchupReward(winnerPoints, loserPoints);

    return {
        winner: winnerPoints + reward,
        loser: loserPoints - reward
    };
}


module.exports = controller;
