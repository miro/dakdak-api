var insertOrUpdate = require('../utils').insertOrUpdate;

exports.seed = function(knex, Promise) {
    return Promise.resolve()
        .then(() => insertOrUpdate(knex, 'users', {
            email: 'foo@bar',
            displayName: 'Admin Foo Bar',
            accessLevel: 9001
        }))
        .then(() => insertOrUpdate(knex, 'users', {
            email: 'keke@sorsa',
            displayName: 'Sorsa Keke',
            accessLevel: 100
        }));
};
