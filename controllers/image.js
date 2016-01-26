// # imageController
//      everything related to images and database options with them
//
'use strict';

var Promise             = require('bluebird');
var _                   = require('lodash');

var db                  = require('../database');
var log                 = require('../log');
var generateUUID        = require('../utils').generateUUID;

var roleService         = require('../services/role');
var imageService        = require('../services/image');

var controller = {};


controller.create = function uploadAndCreate(file, user, props) {

    var fileStorageId = generateUUID(); // will be used as a filename
    var defaultTitle = solveTitleFromFilename(file.originalname);

    return imageService.uploadImage(fileStorageId, file)
        .then(uploadResult => {
            return new db.models.Image({
                storageId: fileStorageId,
                uploaderId: user.id,
                created_at: new Date(),
                hasThumbnailSize: uploadResult.thumb.uploaded,
                hasDisplaySize: uploadResult.display.uploaded,

                width: uploadResult.meta.width,
                height: uploadResult.meta.height,

                year: props.year,
                month: props.month,
                title: defaultTitle
            })
            .save();
        });
};



function solveTitleFromFilename(filename) {
    var nameParts = filename.split('.');
    nameParts.pop(); // remove extension
    return nameParts.join('-');
}

module.exports = controller;
