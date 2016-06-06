'use strict';
var expect              = require('chai').expect;
var assert              = require('chai').assert;
var should              = require('chai').should;
var knexUtils           = require('./utils/knex');

var createUser          = require('./test-utils').createUser;

const ctrl              = require('../controllers/rating');


const userModel = createUser(500, 1);

describe('ratingController', () => {
    before((done) => {
        knexUtils.migrateAllDownAndUp()
        .then(() => knexUtils.runSeeds())
        .then(() => done());
    });


    it('fetches ratings successfully', () => {
        return ctrl.getList(userModel).then(list => {
            assert(list.length > 0);
        });
    });


    it('does not allow to set better image to random id', () => {
        var p = ctrl.getList(userModel)
        .then(list => {
            let ratingItem = list[0];

            return ctrl.rate(
                userModel,
                ratingItem.id,
                ratingItem.secondImage.id * 999 // set the ID to some nonexistent one
            );
        });

        return expect(p).to.be.rejectedWith(Error, 'Saving of rating did not succeed');
    });

    it('allows basic rating of ratingItem', () => {
        return ctrl.getList(userModel)
        .then(list => {
            // Pick the first item from the list
            let ratingItem = list[0];

            return ctrl.rate(
                userModel,
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
});
