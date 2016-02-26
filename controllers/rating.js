// # ratingController
//      everything related to Ratings.
//
//      Rating is a piece of information which tells how specific user ranked
//      two pictures side by side by choosing which one of them is "better".
//
//      These Rating-informations are used to rank all the images in the system
//      via ELO-implementation.


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

var _                   = require('lodash');

var db                  = require('../database');
var imageController     = require('./image');
var log                 = require('../log');

var knex                = db.knex;
var Rating              = db.models.Rating;
var Image               = db.models.Image;

const IMAGES_TABLE      = 'images';
const RATINGS_TABLE     = 'ratings';

const RATING_LIST_LENGTH = 10;
var controller = {};



// Creates list of new "rating pairs" to the user.
// If user has "unfilled rating pairs", they are returned instead
controller.getRatingList = function getRatingListForUser(user) {
    // db.knex.raw('SELECT ID FROM images ORDER BY random() LIMIT 10;')
    //     .then(result => console.log(result.rows));

    knex.select('id').from(IMAGES_TABLE)
        .orderByRaw('random()')
        .limit(RATING_LIST_LENGTH * 10)
        .then(result => getRatingPairs(result));

};

controller.rate = function saveRating(user, ratingId, betterImageId) {

    return db.models.Rating
        .forge({ id: ratingId, raterId: user.get('id') })
        .fetch()
        .then(ratingModel => ratingModel.save({ betterImageId }));
};

// controller.getLocations = function() {
//     return db.models.Spot.forge()
//         .query('where', 'latitude', '<>', 0) // hack to achieve "not null"
//         // .query('limit', AMOUNT_OF_PICS_TO_RETURN)
//         .fetchAll()
//         .then(spotsCollection => {
//             return _.map(spotsCollection.models, spot => {
//                 // This is kind of stupid but I didn't find out how to pass SELECT via Bookshelf
//                 return _.pick(spot.serialize(), ['id', 'name', 'latitude', 'longitude']);
//             });
//         });
// };


function getIncompleteRatings(user) {
    return Rating.forge()
        .query('where', 'raterId', user.get('id'))
}

function getRatingPairs(imageIdRows) {
    if (imageIdRows.length < RATING_LIST_LENGTH * 2) {
        return new Promise.OperationalError('Not enough image IDs for creating new rating pairs');
    }

    const keke = _.chain(imageIdRows)
        .groupBy((row, index) => row.id % 2 === 0 ? '')
        .value()


    console.log('keke', keke);
    return keke;
}

module.exports = controller;
