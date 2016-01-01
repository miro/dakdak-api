'use strict';

let jwt         = require('jsonwebtoken');
let _           = require('lodash');

var cfg         = require('../configurator');


let service = {};

service.getToken = function(userModel) {
    return jwt.sign(
        _.pick(userModel, 'id', 'displayName', 'accessLevel'), // payload
        cfg.jwt.secret,
        { expiresIn: '12h' }
    );
};


module.exports = service;
