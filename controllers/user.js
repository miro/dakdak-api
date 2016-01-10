// # userController
//      everything related to user accounts
//
'use strict';

let Promise             = require('bluebird');
let _                   = require('lodash');

let db                  = require('../database');
let log                 = require('../log');

let controller = {};


controller.getOrCreate = function(provider, providerId, props)  {
    return new Promise((resolve, reject) => {
        controller.getUser({ provider, providerId })
        .then(result => {
            if (_.isNull(result)) {
                log.debug('New user registration!');
                let userProps = parsePropsFromProvider(provider, props);
                userProps.provider = provider;
                userProps.providerId = providerId;

                return resolve(controller.createUser(userProps));
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
    // TODO: match to person automatically if displayName matches?
    return new Promise((resolve, reject) => {
        let model = new db.models.User(props);
        model.save()
        .then(savedProps => resolve(savedProps))
        .error(error => reject(error));
    });
};


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
