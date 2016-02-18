'use strict';
var Model               = require('../database').models.User;


var utils = {};

utils.createUser = function createUser(accessLevel) {
    return new Model({
        name: 'foo',
        accessLevel
    });
};


module.exports = utils;
