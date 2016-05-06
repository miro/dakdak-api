var insertOrUpdate = require('../utils').insertOrUpdate;

exports.seed = function(knex, Promise) {
    return Promise.resolve()
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Foo to the bar',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Foo sdgr',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'dgfe bar',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Foo tfdgr',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Fogsdfgfdsthe bar',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Foo 324he bar',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Fzxc the bar',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Foo gfdar',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Foo gfdar',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Foo gfdar',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Foo gfdar',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Foo gfdar',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Foo gfdar',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Foo gfdar',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Foo gfdar',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Foo gfdar',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Foo gfdar',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Foo gfdar',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Foo gfdar',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Foo gfdar',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Foo gfdar',
            uploaderId: 1
        }))
        .then(() => insertOrUpdate(knex, 'images', {
            title: 'Foobar',
            uploaderId: 1
        }));
};
