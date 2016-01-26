// # imagesService
//      everything related to image manipulation
//
'use strict';

var Promise         = require('bluebird');
var gm              = require('gm').subClass({ imageMagick: true });

var log             = require('../log');
var gcs             = require('./gcs');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/gif', 'image/png'];
var service = {};


service.uploadImage = function uploadImage(imageName, imageFile) {

    return Promise.resolve()
    .then(() => validateMimeType(imageFile.mimetype))
    .then(() => autoOrient(imageFile.buffer))
    .then(rotatedImageBuffer => Promise.props({
        thumb: resizeIntoWidth(rotatedImageBuffer, 320),
        displaySize: resizeIntoWidth(rotatedImageBuffer, 640)
    }))
    .then(buffers => {
        log.debug('Image resizing and stuff OK, starting uploads');
        Promise.props({
            original: gcs.uploadImageBuffer(imageName, imageFile.buffer),
            thumb: gcs.uploadImageBuffer(imageName + '--thumb', buffers.thumb),
            display: gcs.uploadImageBuffer(imageName + '--display', buffers.displaySize),
            meta: getImageInfos(imageFile.buffer)
        });
    });
};


function validateMimeType(mimetype) {
    if (ALLOWED_MIME_TYPES.indexOf(mimetype) < 0) {
        log.info('Unsupported filetype detected');
        let error = new Error('Unsupported file type uploaded');
        error.status = 400;
        return Promise.reject(error);
    }
    else {
        return Promise.resolve();
    }
}

function getImageInfos(imageBuffer) {
    let meta = {};
    gm(imageBuffer)
    .size((err, size) => {
        meta.width = size.width;
        meta.height = size.height;
    })

    return Promise.resolve(meta);
}

function resizeIntoWidth(imageBuffer, width) {
    return new Promise((resolve, reject) => {
        return gm(imageBuffer)
        .resize(width)
        .toBuffer('JPG', ((error, resultBuffer) => {
            (error) ? reject(error) : resolve(resultBuffer);
        }));
    });
}

function autoOrient(imageBuffer) {
    return new Promise((resolve, reject) => {
        gm(imageBuffer)
        .autoOrient()
        .toBuffer('JPG', ((error, resultBuffer) => {
            (error) ? reject(error) : resolve(resultBuffer);
        }));
    });
}

module.exports = service;
