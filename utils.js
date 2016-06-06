var log             = require('./log');
var _               = require('lodash');

var utils = {};

utils.generateUUID = (function() {
    // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
       .toString(16)
       .substring(1);
    }
    return function() {
        return s4() + s4() + s4() + s4();
    };
})();


utils.handleResult = function handleResult(result, res, next) {
    if (result) {
        try {
            res.send(result);
        }
        catch (error) {
            log.error('Error catched on handleResult');
            next(error);
        }
    }
    else {
        res.sendStatus(404);
    }
};

utils.setEmptyStringsNull = function(object) {
    // Set empty strings to null
    // (since frontend might pass some of the integer fields as string, this allows unsetting those)
    // fields - otherwise DB barfs up
    for (var prop in object) {
        if (_.isString(object[prop])) {
            object[prop] = object[prop].length > 0 ? object[prop] : null;
        }
    }

    return object;
}

// Inserts or updates a row to table
// applied from https://github.com/futurice/wappuapp-backend/blob/master/src/util/seeds.js
utils.insertOrUpdate = function(knex, table, row) {
    return knex(table).select().where('id', row.id)
        .then(rows => {
            if (rows.length > 0) {
                return knex(table).where('id', row.id).update(row);
            } else {
                return knex(table).insert(row);
            }
        });
}


module.exports = utils;
