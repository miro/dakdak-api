var config = require('./configurator.js');

var Promise = require('bluebird');
var knex = require('knex')(config.dbConfig);
var bookshelf = require('bookshelf')(knex);
var bcrypt = Promise.promisifyAll(require('bcrypt'));





// # Init the database

// Organisations
bookshelf.knex.schema.hasTable('organisations').then(function(exists) {
    if (!exists) {
        return bookshelf.knex.schema.createTable('organisations', function(t) {
            t.increments('id').primary();
            t.string('name', 50);
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

            t.integer('organisationId')
                .unsigned()
                .references('id')
                .inTable('organisations');
        });
    }
});

// Spots
bookshelf.knex.schema.hasTable('spots').then(function(exists) {
    if (!exists) {
        return bookshelf.knex.schema.createTable('spots', function(t) {
            t.increments('id').primary();
            t.string('name', 50);
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
            t.string('password', 60);
            t.integer('accessLevel').defaultTo(0);

            t.integer('personId')
                .unsigned()
                .references('id').inTable('persons')
                .onDelete('SET NULL');
        });
    }
});


// Images
bookshelf.knex.schema.hasTable('images').then(function(exists) {
    if (!exists) {
        return bookshelf.knex.schema.createTable('images', function(t) {
            t.increments('id').primary();
            t.string('s3id', 50);
            t.string('description', 350);
            t.date('date');
            t.string('themeColor', 10);
            t.boolean('published').defaultTo(false);

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
    models: models
}


