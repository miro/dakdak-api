// # invitationController
//      everything related to invitation codes
//
'use strict';

var Promise             = require('bluebird');
var _                   = require('lodash');

var db                  = require('../database');
var log                 = require('../log');
var roleService         = require('../services/role');

var modelController     = require('../controllers/model');
var userController      = require('../controllers/user');

const INVITEES_USER_ROLE = roleService.roles.EDITOR;

// "Cache"
// save IDs of users who have failed the invitation-check in memory to make brute forcing
// them a bit harder. Since the invitation codes aren't that "powerful", no extra care
// cautioness is done
const MAX_TRY_COUNT = 3;
var cache = { store: {} };
cache.isAllowedToTry = function(user) {
    if (_.isUndefined(this.store[user.id])) {
        this.store[user.id] = 1;
        log.debug('First invitation try for user', user.id);
        return Promise.resolve();
    }
    else if (this.store[user.id] < MAX_TRY_COUNT) {
        this.store[user.id] += 1;
        return Promise.resolve();
    }
    else {
        log.debug('Maximum try count reached - denying for user', user.id, '!');
        let error = new Error('Maximum try count reached');
        error.name = 'INVALID_REQUEST';
        return Promise.reject(error);
    }
};


// The controller to-be-exported
var controller = {};

controller.checkInvitation = function(code, user) {
    log.debug('Invitation challenge! user.id / code:', user.id, code);
    console.log(user);

    return Promise.resolve()
        .then(() => cache.isAllowedToTry(user))
        .then(() => Promise.props({
            invite: modelController.getSingle(db.types.Invitation, { code }), // TODO deep fetch somehow
            user: userController.get({ id: user.id })
        }))
        .then(models => {
            console.log(models);
            log.debug('we should be here ONLY if user was eliglible to challenge the code');
            if (!models.invite) {
                return Promise.reject('Invitation code invalid');
            }

            if (models.user.get('invitationId')) {
                return Promise.reject('User has already used one of the invitation codes');
            }

            // # invitation was kosher -> update user

            let userProps = {}; // these will be updated into user

            models.user.set('invitationId', models.invite.get('id'));

            if (roleService.config[INVITEES_USER_ROLE].level > models.user.get('accessLevel')) {
                // the new role would be an upgrade
                models.user.set('accessLevel', roleService.config[INVITEES_USER_ROLE].level);
            }

            if (models.invite.get('inviteToOrganisation')) {
                models.user.set('organisationId', models.invite.get('inviteToOrganisation'));
            }

            log.debug('User had the right invitation object - updating user with properties', models.user.serialize());
            return models.user.save();
        })
        .then(userModel => Promise.resolve(userModel))
        // .error(error => Promise.reject(error))
        .catch(error => {
            console.log('error plz');
            console.log(error);
            return Promise.reject(error);
        });
};


module.exports = controller;
