// # spotController
//      everything related to Spots
//
'use strict';
var _                   = require('lodash');
var db                  = require('../database');

// The controller to-be-exported
var controller = {};

controller.getLocations = function() {
    return db.models.Spot.forge()
        .query('where', 'latitude', '<>', 0) // hack to achieve "not null"
        // .query('limit', AMOUNT_OF_PICS_TO_RETURN)
        .fetchAll()
        .then(spotsCollection => {
            return _.map(spotsCollection.models, spot => {
                // This is kind of stupid but I didn't find out how to pass SELECT via Bookshelf
                return _.pick(spot.serialize(), ['id', 'name', 'latitude', 'longitude']);
            });
        });
};

module.exports = controller;
