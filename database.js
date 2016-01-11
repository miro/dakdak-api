var config              = require('./configurator.js');

var knex                = require('knex')(config.dbConfig);
var bookshelf           = require('bookshelf')(knex);

// Organisations
bookshelf.knex.schema.hasTable('organisations').then(function(exists) {
    if (!exists) {
        return bookshelf.knex.schema.createTable('organisations', function(t) {
            t.increments('id').primary();
            t.string('name', 50);
        });
    }
});


// invitation codes
bookshelf.knex.schema.hasTable('invitations').then(function(exists) {
    if (!exists) {
        return bookshelf.knex.schema.createTable('invitations', function(t) {
            t.increments('id').primary();
            t.string('code', 100); // the actual invitation code

            t.integer('inviteToOrganisation') // if this invitation is for specific organisation, link it in here
                .unsigned()
                .references('id').inTable('organisations')
                .onDelete('SET NULL');
        });
    }
});


// Persons
bookshelf.knex.schema.hasTable('persons').then(function(exists) {
    if (!exists) {
        return bookshelf.knex.schema.createTable('persons', function(t) {
            t.increments('id').primary();
            t.string('fullName', 50);
            t.string('displayName', 20);
        });
    }
});

// Spots
bookshelf.knex.schema.hasTable('spots').then(function(exists) {
    if (!exists) {
        return bookshelf.knex.schema.createTable('spots', function(t) {
            t.increments('id').primary();
            t.string('name', 50);
            t.text('description');
            t.float('latitude');
            t.float('longitude');
        });
    }
});


// Users
bookshelf.knex.schema.hasTable('users').then(function(exists) {
    if (!exists) {
        return bookshelf.knex.schema.createTable('users', function(t) {
            t.increments('id').primary();
            t.string('email', 100);
            t.string('displayName', 50);
            t.integer('accessLevel').defaultTo(0);

            t.string('provider', 150); // who has authorized this user? Facebook, Google, ..., ?
            t.string('providerId', 150); // what is the ID on the provider's system for this user?
            t.unique(['provider', 'providerId']);

            t.integer('personId')
                .unsigned()
                .references('id').inTable('persons')
                .onDelete('SET NULL');

            t.integer('organisationId')
                .unsigned()
                .references('id')
                .inTable('organisations')
                .onDelete('SET NULL');

            t.integer('invitationId')
                .unsigned()
                .references('id').inTable('invitations')
                .onDelete('SET NULL');
        });
    }
});


// Images
bookshelf.knex.schema.hasTable('images').then(function(exists) {
    if (!exists) {
        return bookshelf.knex.schema.createTable('images', function(t) {
            t.increments('id').primary();
            t.string('storageId', 60).unique(); // identifier for fetching this image on the storage solution (S3/GCS/etc)
            t.timestamps();

            t.string('title', 140);
            t.string('trickName', 350);
            t.text('description');
            t.string('primaryColor', 10);

            t.integer('year');
            t.integer('month');
            t.integer('day');

            t.boolean('published').defaultTo(false);
            t.boolean('hasThumbnailSize').defaultTo(false);
            t.boolean('hasDisplaySize').defaultTo(false);

            t.integer('uploaderId')
                .unsigned()
                .references('id').inTable('users')
                .onDelete('SET NULL');

            t.integer('riderId')
                .unsigned()
                .references('id').inTable('persons')
                .onDelete('SET NULL');

            t.integer('photographerId')
                .unsigned()
                .references('id').inTable('persons')
                .onDelete('SET NULL');

            t.integer('spotId')
                .unsigned()
                .references('id').inTable('spots')
                .onDelete('SET NULL');
        });
    }
});




// # Define models
var models = {};

models.Image = bookshelf.Model.extend({
    tableName: 'images'
});
models.Invites = bookshelf.Model.extend({
    tableName: 'invitations'
});
models.Person = bookshelf.Model.extend({
    tableName: 'persons'
});
models.Spot = bookshelf.Model.extend({
    tableName: 'spots'
});
models.User = bookshelf.Model.extend({
    tableName: 'users'
});
models.Organisation = bookshelf.Model.extend({
    tableName: 'organisations'
});



module.exports = {
    bookshelf: bookshelf,
    models: models,
    knex: bookshelf.knex
}


