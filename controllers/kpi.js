// # kpiController
//      everything related to "KPI-data" of this API
//
'use strict';

var Promise             = require('bluebird');
var _                   = require('lodash');

var db                  = require('../database');
var log                 = require('../log');
var modelController     = require('../controllers/model');

// data will be stored to this object, and it will be updated only when
// asked to. This is done to minimize DB load
var kpi = { pixelCount: 0, imageCount: 0 };

var controller = {};

controller.getKpi = function() {
    return _.clone(kpi);
};

controller.updateKpi = function() {
    return Promise.props({
        imageCount: modelController.getCount(db.types.Image),
        pixelCount: getPixelsUploaded()
    })
    .then(data => {
        kpi.imageCount = parseInt(data.imageCount, 10);
        kpi.pixelCount = parseInt(data.pixelCount, 10);

        log.debug('KPI-data updated');
    });
}


// Get total amount of pixels of images currently in the images-table.
// WOW SUCH USEFUL INFO!
function getPixelsUploaded() {
    return db.knex.raw('SELECT SUM(width * height) as pixels_count from images')
        .then(result => Promise.resolve(result.rows[0].pixels_count));
}


// Automatically run the update on first import
controller.updateKpi();
module.exports = controller;
