'use strict';
var expect              = require('chai').expect;

const roleService       = require('../services/role');
const roles = roleService.roles;


describe('roleService', () => {
    it('sets user with undefined level to UNREGISTERED', () => {
        let user = roleService.solveRole({ name: 'foo' });
        expect(user.role).to.equal(roles.UNREGISTERED);
    });


    it('sets user with level 0 to USER', () => {
        let user = createUser(0);
        roleService.solveRole(user);
        expect(user.role).to.equal(roles.USER);
    });


    it('sets user with level 10 to EDITOR', () => {
        let user = createUser(10);
        roleService.solveRole(user);
        expect(user.role).to.equal(roles.EDITOR);
    });


    it('sets user with level 100 to ADMIN', () => {
        let user = createUser(100);
        roleService.solveRole(user);
        expect(user.role).to.equal(roles.ADMIN);
    });

    it('user should not have accessLevel after the role is solved', () => {
        let user = createUser(10);
        roleService.solveRole(user);
        expect(user.accessLevel).to.equal(undefined);
    });
});


function createUser(accessLevel) {
    return {
        name: 'foo',
        accessLevel
    };
}
