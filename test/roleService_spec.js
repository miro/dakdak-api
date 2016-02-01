'use strict';
var expect              = require('chai').expect;

const roleService       = require('../services/role');
const roles = roleService.roles;


describe('roleService', () => {
    // TODO: FIX THESE TO WORK WITH USER-BOOKSHELF-MODELS instead of PLAIN OBJECTS
    // :(


    // # accessLevel -> role tests
    //
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


    // # isAuthorized-tests
    //
    it('will not authorize UNREGISTERED role to ADMIN', () => {
        let user = { name: 'foo', role: roles.ADMIN };
        const authorized = roleService.isAuthorized(user, roles.ADMIN);
        expect(authorized).to.equal(true);
    });

    it('will authorize EDITOR role to USER', () => {
        let user = { name: 'foo', role: roles.EDITOR };
        const authorized = roleService.isAuthorized(user, roles.USER);
        expect(authorized).to.equal(true);
    });

    it('will authorize UNREGISTERED role to UNREGISTERED', () => {
        let user = { name: 'foo', role: roles.UNREGISTERED };
        const authorized = roleService.isAuthorized(user, roles.UNREGISTERED);
        expect(authorized).to.equal(true);
    });

    it('will NOT authorize USER role to ADMIN', () => {
        let user = { name: 'foo', role: roles.USER };
        const authorized = roleService.isAuthorized(user, roles.ADMIN);
        expect(authorized).to.equal(false);
    });

    it('will NOT authorize UNREGISTERED role to USER', () => {
        let user = { name: 'foo', role: roles.UNREGISTERED };
        const authorized = roleService.isAuthorized(user, roles.USER);
        expect(authorized).to.equal(false);
    });

    it('will NOT authorize udefined role to USER', () => {
        let user = { name: 'foo', role: undefined };
        const authorized = roleService.isAuthorized(user, roles.UNREGISTERED);
        expect(authorized).to.equal(false);
    });
});


function createUser(accessLevel) {
    return {
        name: 'foo',
        accessLevel
    };
}
