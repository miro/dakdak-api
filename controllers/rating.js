// # ratingController
//      everything related to Ratings.
//
//      Rating is a piece of information which tells how specific user ranked
//      two pictures side by side by choosing which one of them is "better".
//
//      These Rating-informations are used to rank all the images in the system
//      via ELO-implementation.
//
//  Cheers to Kimmo Brunfeldt - this solution is heavily inspired by his example:
//  https://github.com/kimmobrunfeldt/dakdak-problem/blob/master/get-pairs.js



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
var Promise             = require('bluebird');
var G                   = require('generatorics');

var db                  = require('../database');
var imageController     = require('./image');
var log                 = require('../log');

var knex                = db.knex;
var RatingModel         = db.models.Rating;
var ImageModel          = db.models.Image;

const IMAGES_TABLE      = 'images';
const RATINGS_TABLE     = 'ratings';

const NEW_RATING_LIST_LENGTH = 10;
var controller = {};



// Creates list of new "rating pairs" to the user.
// If user has "unfilled rating pairs", they are returned instead
controller.getRatingList = function getRatingListForUser(user) {

    return RatingModel.forge()
    .query(function(qb) {
        qb.whereNull('betterImageId');
        qb.andWhere('raterId', '=', user.get('id'));
    })
    .fetchAll()
    .then(existingUnfilledRatings => {
        if (existingUnfilledRatings.length > 0) {
            // user has unfilled ratings -> return them
            log.debug('Rating pairs found', existingUnfilledRatings.length)
            return Promise.resolve(existingUnfilledRatings.serialize());
        } else {
            // user has no ratings to fill -> generate new ones to him
            getNewRatingPairs(existingUnfilledRatings).then(newPairs => {
                var createOperations = _.reduce(newPairs, (result, ratingPair) => {
                    result.push(controller.create(user, ratingPair))
                    return result;
                }, []);

                return Promise.all(createOperations).then(models => {
                    return Promise.resolve(_.map(models, model => model.serialize()));
                });
            });
        }
    });
};


controller.create = function createRating(user, ratingPair) {
    return RatingModel
        .forge({
            created_at: new Date(),
            raterId: user.get('id'),
            firstImageId: ratingPair.firstImageId,
            secondImageId: ratingPair.secondImageId
        })
        .save();
};


controller.rate = function saveRating(user, ratingId, betterImageId) {
    return RatingModel
        .forge({ id: ratingId, raterId: user.get('id') })
        .fetch()
        .then(ratingModel => ratingModel.save({ betterImageId }));
};


function getNewRatingPairs(userRatings) {
    return imageController.insecure.getPublicImages()
    .then(publicImages => {

        var imageIds = _.map(publicImages.models, model => model.get('id'));
        var ratings = _.map(userRatings.models, model => ({
            firstImageId: model.get('firstImageId'),
            secondImageId: model.get('secondImageId')
        }));

        // Get list of unrated pairs
        var unratedPairs = [];
        for (var pair of generatePairs(ratings, imageIds)) {
            const firstImageId = pair[0] < pair[1] ? pair[0] : pair[1];
            const secondImageId = pair[0] < pair[1] ? pair[1] : pair[0];
            unratedPairs.push({ firstImageId, secondImageId });
        }

        const pairItems = _.chain(unratedPairs)
            .groupBy(item => item.firstImageId)
            .map(idGroup => idGroup[_.random(0, idGroup.length - 1)])
            .splice(0, NEW_RATING_LIST_LENGTH)
            .value();

        return Promise.resolve(pairItems);
    });
}


// Get N image pairs which user has not rated
function* generatePairs(userRatings, images) {
    for (var tuple of G.combination(images, 2)) {
        // Get only pairs which are not yet rated
        if (!hasUserRated(userRatings, tuple[0], tuple[1])) {
            yield tuple;
        }
    }
}

function hasUserRated(userRatings, firstImageId, secondImageId) {
    var index = _.findIndex(userRatings, r => {
        // Test both ways - just to make it sure
        const orderA = firstImageId === r.firstImageId && secondImageId === r.secondImageId;
        const orderB = firstImageId === r.secondImageId && secondImageId === r.firstImageId;
        return orderA || orderB;
    });

  return index !== -1;
}



module.exports = controller;
