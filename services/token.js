'use strict';

let jwt         = require('jsonwebtoken');
let _           = require('lodash');

var cfg         = require('../configurator');


let service = {};

service.getToken = function(userModel) {
    let user = userModel.serialize();
    return jwt.sign(
        _.pick(user, 'id', 'displayName', 'role', 'organisationId', 'invitationId'), // payload
        cfg.jwt.secret,
        { expiresIn: '12h' }
    );
};


module.exports = service;
