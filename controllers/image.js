// # imageController
//      everything related to images and database options with them
//
'use strict';

var Promise             = require('bluebird');
var _                   = require('lodash');

var db                  = require('../database');
var log                 = require('../log');
var utils               = require('../utils');

var modelController     = require('../controllers/model');

var roleService         = require('../services/role');
var imageService        = require('../services/image');

var controller = {};


controller.create = function uploadAndCreate(file, user, props) {
    var fileStorageId = utils.generateUUID(); // will be used as a filename
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
    // NOTE: this function should follow the same logic as userCanEditPhoto does
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

controller.update = function(imageId, requestBody, user) {
    // TODO: set updated_at
    // Pick props which are allowed to update from what user has provided
    var updatedProps = _.pick(requestBody,
        'title', 'trickName', 'description', 'date', 'riderId', 'photographerId', 'spotId', 'published',
        'year', 'month', 'day'
    );
    updatedProps = utils.setEmptyStringsNull(updatedProps);

    return db.models.Image.forge({ id: imageId })
        .fetch({ withRelated: ['organisation'] })
        .then(imageModel => {
            if (userCanEditPhoto(imageModel, user)) {
                return imageModel.save(updatedProps, { patch: true});
            }
            else {
                var error = new Error('Unauthorized Image editing');
                error.status = 401;
                return Promise.reject(error);
            }
        });
};

controller.getLatest = function() {
    const AMOUNT_OF_PICS_TO_RETURN = 10;

    return db.models.Image.forge()
        .query('orderBy', 'id', 'desc')
        .query('where', 'spotId', '<>', 0) // hack to achieve "not null"
        .query('where', 'riderId', '<>', 0)
        .query('limit', AMOUNT_OF_PICS_TO_RETURN)
        .fetchAll({ withRelated: [
            'rider', 'photographer', 'spot', 'organisation'
        ]});
};

function userCanEditPhoto(imageModel, user) {
    // NOTE: logic of this function should follow the same logic as getAll() does
    if (imageModel.get('uploaderId') === user.id) {
        log.debug('User is editing their own photo');
        return true;
    }
    else if (imageModel.related('organisation').get('id') === user.organisationId) {
        log.debug('User is editing photo from their own organisation');
        return true;
    }
    else if (roleService.isAuthorized(user, roleService.roles.ADMIN)) {
        log.debug('Admin is editing photo');
        return true;
    }
    else {
        log.error('User tried unauthorized photo editing!');
        return false;
    }

}

function solveTitleFromFilename(filename) {
    var nameParts = filename.split('.');
    nameParts.pop(); // remove extension
    return nameParts.join('-');
}

module.exports = controller;
