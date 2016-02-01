// # userController
//      everything related to user accounts
//
'use strict';

let Promise             = require('bluebird');
let _                   = require('lodash');

let db                  = require('../database');
let log                 = require('../log');
let roleService         = require('../services/role');

let controller = {};


controller.getOrCreate = function(provider, providerId, props)  {
    return new Promise((resolve, reject) => {
        controller.get({ provider, providerId })
        .then(userModel => {
            if (_.isNull(userModel)) {
                log.debug('New user registration!');
                let userProps = parsePropsFromProvider(provider, props);
                userProps.provider = provider;
                userProps.providerId = providerId;

                return resolve(controller.create(userProps));
            }
            else {
                log.debug('Existing user login!');
                return resolve(userModel);
            }
        });
    });
};

controller.get = function(whereObject) {
    return new db.models.User()
    .where(whereObject)
    .fetch()
    .then(result => Promise.resolve(formatUserModel(result)));
};

controller.create = function(props) {
    // TODO: match to person automatically if displayName matches?
    return new Promise((resolve, reject) => {
        let model = new db.models.User(props);
        model.save()
        .then(savedProps => resolve(savedProps))
        .error(error => reject(error));
    });
};



// This function takes in Bookshelf's User-model, serializes it,
// and "solves" attributes required by this application into it
function formatUserModel(userModel) {
    if (_.isNull(userModel)) return null;

    // Do the required modifications into the object
    roleService.solveRole(userModel);

    return userModel;
}


function parsePropsFromProvider(provider, props) {
    switch(provider) {
        case 'facebook':
        case 'google':
            let parsedProps = {};
            parsedProps.displayName = props.displayName;

            // email-attribute from Facebook is an array containing objects, such as:
            // emails: [ { value: 'derpy.developer@foo.com' } ]
            // pick the first one from that list
            if (props.emails && props.emails.length > 0) {
                parsedProps.email = props.emails[0].value;
            }

            return parsedProps;

        default:
            log.error('No idea how to parse props for provider', provider);
            return props;
    }
}

module.exports = controller;
