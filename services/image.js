var Promise         = require('bluebird');
var gm              = require('gm').subClass({ imageMagick: true });

var log             = require('../log');
var gcs             = require('./googleCloud');


var service = {};

service.uploadImage = function uploadImage(imageName, imageFile) {

    var allowedMimetypes = ['image/jpeg', 'image/gif', 'image/png'];
    if (allowedMimetypes.indexOf(imageFile.mimetype) < 0) {
        log.info('Unsupported filetype detected');
        return Promise.reject({ status: 400, message: 'Unsupported file type uploaded' });
    }

    return Promise.resolve()
    .then(() => autoOrient(imageFile.buffer))
    .then(rotatedImageBuffer => Promise.props({
        thumb: resizeIntoWidth(rotatedImageBuffer, 320),
        displaySize: resizeIntoWidth(rotatedImageBuffer, 640)
    }))
    .then(buffers => Promise.props({
        original: gcs.uploadImageBuffer(imageName, imageFile.buffer),
        thumb: gcs.uploadImageBuffer(imageName + '--thumb', buffers.thumb),
        display: gcs.uploadImageBuffer(imageName + '--display', buffers.displaySize)
    }))
    .then(uploads => uploads)
    .catch(error => {
        log.error(error);
        return new Error(error);
    });
};

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
