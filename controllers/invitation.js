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


// The controller to-be-exported
var controller = {};

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
        error.status = 403;
        return Promise.reject(error);
    }
};


controller.checkInvitation = function(code, user) {
    log.debug('Invitation challenge! user.id / code:', user.id, code);

    // Change code to lowercase so the case won't matter
    code = code.toLowerCase();

    return Promise.resolve()
        .then(() => cache.isAllowedToTry(user))
        .then(() => Promise.props({
            invite: modelController.getSingle(db.types.Invitation, { code }), // TODO deep fetch somehow
            user: userController.get({ id: user.id })
        }))
        .then(models => {
            if (!models.invite) {
                let error = new Error('Invitation code invalid');
                error.status = 400;
                return Promise.reject(error);
            }

            if (models.user.get('invitationId')) {
                let error = new Error('User has already used one of the invitation codes');
                error.status = 410;
                return Promise.reject(error);
            }

            // # invitation was kosher -> update user

            models.user.set('invitationId', models.invite.get('id'));

            // Update user accessLevel only if it would be an upgrade
            if (roleService.config[INVITEES_USER_ROLE].level > models.user.get('accessLevel')) {
                // the new role would be an upgrade
                models.user.set('accessLevel', roleService.config[INVITEES_USER_ROLE].level);
                models.user.set('role', roleService.config[INVITEES_USER_ROLE].name);
            }

            // If this invite is invitation to some organisation, set user into that
            if (models.invite.get('inviteToOrganisation')) {
                models.user.set('organisationId', models.invite.get('inviteToOrganisation'));
            }

            log.debug('User had the right invitation code - updating user with properties', models.user.serialize());
            return models.user.save();
        })
        .then(userModel => Promise.resolve(userModel))
        .catch(error => {
            return Promise.reject(error);
        });
};


module.exports = controller;
