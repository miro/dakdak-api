var dbConfig = {
    client: 'postgresql',
    connection: {
        host: 'localhost',
        user: 'dakdak',
        port: 5432,
        password: 'dakdak',
        database: 'dakdak',
        charset: 'utf8'
    }
};


var Promise = require('bluebird');
var knex = require('knex')(dbConfig);
var bookshelf = require('bookshelf')(knex);
var bcrypt = Promise.promisifyAll(require('bcrypt'));







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
// TODO


// Images
bookshelf.knex.schema.hasTable('images').then(function(exists) {
    if (!exists) {
        return bookshelf.knex.schema.createTable('images', function(t) {
            t.increments('id').primary();
            t.string('s3id', 50);
            t.string('description', 350);
            t.date('date');
            t.string('themeColor', 10);

            t.integer('riderId')
                .unsigned()
                .references('id')
                .inTable('persons')
                .onDelete('SET NULL');

            t.integer('photographerId')
                .unsigned()
                .references('id')
                .inTable('persons')
                .onDelete('SET NULL');

            t.integer('spotId')
                .unsigned()
                .references('id')
                .inTable('spots')
                .onDelete('SET NULL');
        });
    }
});


