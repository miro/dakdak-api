// Applied from https://github.com/futurice/wappuapp-backend/blob/master/test/util/knex.js
var Promise = require('bluebird');

var db = require('../../database');
var knex = db.knex;

function migrateAllDownAndUp() {
    return migrateAllDown()
        .then(() => knex.migrate.latest(db.config));
}

function migrateAllDown() {
    return knex.migrate.currentVersion()
        .then(version => {
            if (version !== 'none') {
                return knex.migrate.rollback()
                    .then(() => migrateAllDown());
                } else {
                    return Promise.resolve();
                }
        });
}

function runSeeds() {
    return knex.seed.run(db.config);
}


module.exports = {
    migrateAllDownAndUp,
    migrateAllDown,
    runSeeds
};
