// # roleService
//      hacky way to transform integers into.. ROLES \o/
//
'use strict';
let _           = require('lodash');

let service = {};

const roles = {
    // From most extensive role to least extensive role.
    // Each role has the rights from the roles below

    ADMIN: {
        name: 'ADMIN',
        level: 100
        // + dowatchyoulike-rights
    },

    EDITOR: {
        name: 'EDITOR',
        level: 10
        // + can create and edit spots/persons
    },

    USER: {
        name: 'USER',
        level: 0
        // + has registered via some provider
        // + can upload Images
        // + can edit own Images
    },

    UNREGISTERED: {
        name: 'UNREGISTERED'
        // + basically nothing (this isn't actually supported right now)
    }
};
// Generate object from roles object for simplified usage
service.roles = {};
for (var role in roles) {
    service.roles[role] = role;
}


service.solveRole = function(user) {
    // Solve the role name
    var roleName = null;

    if (_.isUndefined(user.accessLevel)) {
        roleName = service.roles.UNREGISTERED;
    }

    const role = _.find(roles, role => (user.accessLevel >= role.level));
    if (!_.isUndefined(role)) {
        roleName = role.name;
    }

    // Update that name to user and return it
    user.role = roleName;
    delete user.accessLevel;
    return user;
};


module.exports = service;
