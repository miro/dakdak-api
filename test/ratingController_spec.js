'use strict';
var expect              = require('chai').expect;
var assert              = require('chai').assert;
var knexUtils           = require('./utils/knex');

const ctrl              = require('../controllers/rating');



const RATER_DEVICE_ID = '1234-foobar-789';

describe('ratingController', () => {
    // "global" test vars
    var ratingsListInitialLength = null;

    before((done) => {
        knexUtils.migrateAllDownAndUp()
        .then(() => knexUtils.runSeeds())
        .then(() => done());
    });


    it('fetches ratings successfully', () => {
        return ctrl.getList(RATER_DEVICE_ID).then(list => {
            ratingsListInitialLength = list.length;
            assert(list.length > 0);
        });
    });


    it('allows re-fetching of ratings', () => {
        // this should NOT invoke new rating generation
        return ctrl.getList(RATER_DEVICE_ID).then(list => {
            assert(list.length > 0);
        });
    });


    it('does not allow to set better image to random id', () => {
        var p = ctrl.getList(RATER_DEVICE_ID)
        .then(list => {
            let ratingItem = list[0];

            return ctrl.rate(
                RATER_DEVICE_ID,
                ratingItem.id,
                ratingItem.secondImage.id * 999 // set the ID to some nonexistent one
            );
        });

        return expect(p).to.be.rejectedWith(Error, 'Saving of rating did not succeed');
    });


    it('allows basic rating of ratingItem', () => {
        return ctrl.getList(RATER_DEVICE_ID)
        .then(list => {
            // Pick the first item from the list
            let ratingItem = list[0];

            return ctrl.rate(
                RATER_DEVICE_ID,
                ratingItem.id,
                ratingItem.secondImage.id
            );
        })
        .then(rating => {
            assert.equal(
                rating.secondImageId,
                rating.betterImageId,
                'Second image should be set to better image'
            );

            assert.isAbove(
                rating.secondImage.rating,
                rating.firstImage.rating,
                'For the first rating ever winner image should have more points than loser'
            );
        });
    });


    it('ratings list is shorter after "rating" of one item', () => {
        // this should NOT invoke new rating generation
        return ctrl.getList(RATER_DEVICE_ID).then(list => {
            assert(list.length < ratingsListInitialLength);
        });
    });
});
