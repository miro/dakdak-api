'use strict';
var expect              = require('chai').expect;

var createUser          = require('./test-utils').createUser;

const ctrl       = require('../controllers/rating');


describe('ratingController', () => {
    it('handles things', () => {
        ctrl.getRatingList({});

        // expect(user.role).to.equal(roles.UNREGISTERED);
    });

});
