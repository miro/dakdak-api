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

// http://stackoverflow.com/questions/164831/how-to-rank-a-million-images-with-a-crowdsourced-sort
'use strict';

var _                   = require('lodash');
var Promise             = require('bluebird');
var G                   = require('generatorics');

var db                  = require('../database');
var imageController     = require('./image');
var eloController       = require('./elo');
var log                 = require('../log');

var RatingModel         = db.models.Rating;

const NEW_RATING_LIST_LENGTH = 10; // how many rating models will be generated in one batch
var controller = {};



// Creates list of new "rating pairs" to the user.
// If user has "unfilled rating pairs", they are returned instead
controller.getList = function getRatingListForUser(raterDeviceId) {

    return fetchUnrated(raterDeviceId).then(existingUnfilledRatings => {
        if (existingUnfilledRatings.length > 0) {
            // user has unfilled ratings -> return them
            log.debug('Rating pairs found', existingUnfilledRatings.length);
            // log.debug(existingUnfilledRatings);
            // return Promise.resolve(existingUnfilledRatings);
            return existingUnfilledRatings;
        } else {
            // user has no ratings to fill -> generate new ones to him
            log.debug('No pairs found for user - generating');

            return getNewRatingPairs(existingUnfilledRatings).then(newPairs => {
                var createOperations = _.reduce(newPairs, (result, ratingPair) => {
                    result.push(createRating(raterDeviceId, ratingPair));
                    return result;
                }, []);

                return Promise.all(createOperations)
                .then(models => {
                    return Promise.resolve(fetchUnrated(raterDeviceId));
                });
            });
        }
    });
};


controller.rate = function saveRating(raterDeviceId, ratingId, betterImageId) {

    return Promise.resolve()
        .then(() => db.bookshelf.transaction(transacting =>
            RatingModel
            .forge({ id: ratingId, raterDeviceId })
            .fetch({
                withRelated: ['firstImage', 'secondImage'],
                transacting
            })
            .then(ratingModel => {
                let firstImage = ratingModel.related('firstImage');
                let secondImage = ratingModel.related('secondImage');

                if (betterImageId !== firstImage.get('id') &&
                    betterImageId !== secondImage.get('id')) {
                    throw new Error('Invalid betterImageId');
                }
                const firstImageWins = betterImageId === firstImage.get('id');

                // count the "reward" & new points for this "matchup"
                const newRatings = firstImageWins ?
                    eloController.calculateNewRatings(
                        firstImage.get('rating'),
                        secondImage.get('rating')
                    )
                :
                    eloController.calculateNewRatings(
                        secondImage.get('rating'),
                        firstImage.get('rating')
                    );


                // save everything
                return Promise.all([
                    ratingModel.save(
                        { betterImageId, updated_at: new Date() },
                        { transacting }
                    ),
                    firstImage.save(
                        { rating: firstImageWins ? newRatings.winner : newRatings.loser },
                        { transacting }
                    ),
                    secondImage.save(
                        { rating: firstImageWins ? newRatings.loser : newRatings.winner },
                        { transacting }
                    )
                ]);
            })
            .then(result => result[0]) // pick the ratingModel from result array
            .then(ratingModel => ratingModel.serialize())
        ))
        .catch(error => {
            log.error(error);
            var err = new Error('Saving of rating did not succeed');
            err.status = 500;
            throw err;
        });
};



function createRating(raterDeviceId, ratingPair) {
    return RatingModel
        .forge({
            raterDeviceId,
            created_at: new Date(),
            firstImageId: ratingPair.firstImageId,
            secondImageId: ratingPair.secondImageId
        })
        .save();
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

function fetchUnrated(raterDeviceId) {
    return RatingModel.forge()
    .query(function(qb) {
        qb.whereNull('betterImageId');
        qb.andWhere('raterDeviceId', '=', raterDeviceId);
    })
    .fetchAll({
        withRelated: ['firstImage', 'secondImage']
    })
    .then(models => models.serialize());
}


module.exports = controller;
