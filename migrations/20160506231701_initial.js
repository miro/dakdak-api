
exports.up = function(knex, Promise) {
  // Organisations
    return knex.schema.createTable('organisations', function(t) {
        t.increments('id').primary();
        t.string('avatarStorageId', 60); // if organisation has logo in the bucket
        t.boolean('avatarHasThumbnailSize').defaultTo(false);
        t.string('name', 50);
    }).then(() => {
        // invitation codes
        return knex.schema.createTable('invitations', function(t) {
            t.increments('id').primary();
            t.string('code', 100); // the actual invitation code

            t.integer('inviteToOrganisation') // if this invitation is for specific organisation, link it in here
                .unsigned()
                .references('id').inTable('organisations')
                .onDelete('SET NULL');
        });
    }).then(() => {
        // Persons
        return knex.schema.createTable('persons', function(t) {
            t.increments('id').primary();
            t.string('fullName', 50);
            t.string('displayName', 20);
        });
    }).then(() => {
        // Spots
        return knex.schema.createTable('spots', function(t) {
            t.increments('id').primary();
            t.string('name', 50);
            t.text('description');
            t.float('latitude');
            t.float('longitude');
        });
    }).then(() => {
        // Users
        return knex.schema.createTable('users', function(t) {
            t.increments('id').primary();
            t.string('email', 100);
            t.string('displayName', 50);

            t.integer('accessLevel').defaultTo(0);
            t.string('role', 100);

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
    }).then(() => {
        // Images
        return knex.schema.createTable('images', function(t) {
            t.increments('id').primary();
            t.string('storageId', 60).unique(); // identifier for fetching this image on the storage solution (S3/GCS/etc)
            t.timestamps();

            t.string('title', 140);
            t.string('trickName', 350);
            t.text('description');

            t.string('primaryColor', 10);
            t.integer('width');
            t.integer('height');

            t.integer('year');
            t.integer('month');
            t.integer('day');

            t.integer('rating');

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
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('organisations')
        .then(() => knex.schema.dropTable('invitations'))
        .then(() => knex.schema.dropTable('persons'))
        .then(() => knex.schema.dropTable('spots'))
        .then(() => knex.schema.dropTable('users'))
        .then(() => knex.schema.dropTable('images'));
};
