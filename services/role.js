// # roleService
//      hacky way to transform integers into.. ROLES \o/
//
'use strict';
var _           = require('lodash');
var log         = require('../log');

var service = {};

const rolesConfig = [
    // From least extensive role to the most extensive role.
    // Each role has the rights from the previous levels in addition of its own

    {
        name: 'UNREGISTERED'
        // no leve, this is the default fallback role
        // + basically nothing (this isn't actually supported right now)
    },

    {
        name: 'USER',
        level: 0
        // + has registered via some provider
        // + can upload Images
        // + can edit own Images
    },

    {
        name: 'EDITOR',
        level: 10
        // + can create and edit spots/persons
    },

    {
        name: 'ADMIN',
        level: 100
        // + dowatchyoulike-rights
    }
];
// Generate object from roles object for simplified usage
service.roles = {};
_.each(rolesConfig, role => service.roles[role.name] = role.name);
const roles = service.roles; // shortcut for convenience

service.config = _.reduce(rolesConfig, (result, item) => {
    result[item.name] = item;
    return result;
}, {});


// Replace user.accessLevel with the role name
// Modifies the user object in-place!
service.solveRole = function(userModel) {
    // Solve the role name
    var roleName = null;

    if (_.isUndefined(userModel.get('accessLevel'))) {
        roleName = roles.UNREGISTERED;
    }

    const role = _.findLast(rolesConfig, role => (userModel.get('accessLevel') >= role.level));
    if (!_.isUndefined(role)) {
        roleName = role.name;
    }

    // Update that name to user and return it
    userModel.set('role', roleName);
    return userModel;
};


// Check if user is allowed to run stuff which are available only for requiredRole,
// returns the result as boolean. Will fallback to false
service.isAuthorized = function checkUserHasRequiredUserLevel(user, requiredRole) {
    const userRoleIndex = _.findIndex(rolesConfig, { name: user.role });
    const requiredRoleIndex = _.findIndex(rolesConfig, { name: requiredRole });

    if (userRoleIndex >= 0 && requiredRoleIndex >= 0) {
        return (userRoleIndex >= requiredRoleIndex);
    }
    else if (userRoleIndex < 0 && requiredRoleIndex < 0) {
        // user had unregistered/undefined role, but so was the required role -> return true
        // NOTE: this might be again begging for errors..
        return true;
    }
    else {
        // otherwise, fallback to false
        log.debug('Fallbacked to false in authorization');
        return false;
    }
};


// Middleware for defining required role to Express route
// this uses service.isAuthorized while checking it
service.requiredRoleMiddleware = function(requiredRole) {
    // TODO: should the resulting function be cached somehow? does this create a new function
    // on each call?
    // (http://stackoverflow.com/questions/12737148/creating-a-expressjs-middleware-that-accepts-parameters)
    return function(req, res, next) {
        if (service.isAuthorized(req.user, requiredRole)) {
            next();
        }
        else {
            res.sendStatus(403); // 403 forbidden
        }
    };
}


module.exports = service;
