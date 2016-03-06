'use strict';
var Model               = require('../database').models.User;


var utils = {};

utils.createUser = function createUser(accessLevel, id) {
    return new Model({
        name: 'foo',
        accessLevel,
        id: id ? id : 0
    });
};


module.exports = utils;
