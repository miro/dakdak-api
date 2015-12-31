// # userController
//      everything related to user accounts
//
'use strict';

let Promise             = require('bluebird');
let _                   = require('lodash');

let db                  = require('../database');
let log                 = require('../log');

let controller = {};


controller.getOrCreate = function(provider, providerId)  {
    return new Promise((resolve, reject) => {
        controller.getUser({ provider, providerId })
        .then(result => {
            if (_.isNull(result)) {
                log.debug('New user registration!');
                return resolve(controller.createUser({ provider, providerId }));
            }
            else {
                log.debug('Existing user login!');
                return resolve(result.serialize());
            }
        });
    });
};

controller.getUser = function(whereObject) {
    return new Promise((resolve, reject) => {
        new db.models.User()
        .where(whereObject)
        .fetch()
        .then(result => resolve(result))
        .error(error => reject(error));
    });
};

controller.createUser = function(props) {
    return new Promise((resolve, reject) => {
        let model = new db.models.User(props);
        model.save()
        .then(savedProps => resolve(savedProps))
        .error(error => reject(error));
    });
};



module.exports = controller
