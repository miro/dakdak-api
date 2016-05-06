exports.up = function(knex, Promise) {
    return knex.schema.createTable('ratings', function(t) {
        t.increments('id').primary();
        t.timestamps();

        // Who is making this rating
        t.integer('raterId')
            .unsigned()
            .references('id').inTable('users')
            .onDelete('SET NULL');

        // First image and second image makes the "pair" which is rated on this
        // rating entry
        t.integer('firstImageId')
            .unsigned()
            .references('id').inTable('images')
            .onDelete('SET NULL');
        t.integer('secondImageId')
            .unsigned()
            .references('id').inTable('images')
            .onDelete('SET NULL');

        t.unique(['raterId', 'firstImageId', 'secondImageId']);

        // Id for the "winner" of this rating entry
        t.integer('betterImageId')
            .unsigned()
            .references('id').inTable('images')
            .onDelete('SET NULL');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('ratings');
};
