'use strict';
var expect              = require('chai').expect;

var createUser          = require('./test-utils').createUser;

const ctrl       = require('../controllers/rating');


describe('ratingController', () => {
    it('handles things', () => {
        let userModel = createUser(500, 1);
        ctrl.getRatingList(userModel).then(list => console.log(list));

        // expect(user.role).to.equal(roles.UNREGISTERED);
    });

});
