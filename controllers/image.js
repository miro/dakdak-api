// # imageController
//      everything related to images and database options with them
//
'use strict';

var Promise             = require('bluebird');
var _                   = require('lodash');

var db                  = require('../database');
var log                 = require('../log');
var generateUUID        = require('../utils').generateUUID;

var modelController     = require('../controllers/model');

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

// This function defines what images does the user see
controller.getAll = function getAllImagesForUser(user) {
    var whereObject = {};

    if (roleService.isAuthorized(user, roleService.roles.ADMIN)) {
        log.debug('Admin user fetched images');

        // we can return all the images!
        return new db.models.Image()
            .query('orderBy', 'id', 'desc')
            .fetchAll();
    }
    else if (user.organisationId) {
        // user has organisation - fetch images which belongs to that organisation
        log.debug('User with organisation', user.organisationId, 'fetched images');

        return db.models.Organisation.forge({ id: user.organisationId })
            .fetch({ withRelated: 'images' })
            .then(function(organisation) {
              return Promise.resolve(organisation.related('images'));
            });
    }
    else {
        // fallback: set where-object to return images only for this user
        return new db.models.Image()
            .query('orderBy', 'id', 'desc')
            .where({ uploaderId: user.id })
            .fetchAll();
    }
};



function solveTitleFromFilename(filename) {
    var nameParts = filename.split('.');
    nameParts.pop(); // remove extension
    return nameParts.join('-');
}

module.exports = controller;
