var Promise         = require('bluebird');
var gm              = require('gm').subClass({ imageMagick: true });

var log             = require('../log');
var gcs             = require('./googleCloud');


var service = {};

service.uploadImage = function uploadImage(imageName, imageFile) {
    return new Promise((resolve, reject) => {

        // TODO allow png+gif
        if (imageFile.mimetype !== 'image/jpeg') {
            log.info('Unsupported filetype detected');
            return reject({ status: 400, message: 'Unsupported file type uploaded' });
        }

        autoOrient(imageFile.buffer)
        .then(rotatedImageBuffer =>
        Promise.props({
            thumb: _resizeIntoWidth(rotatedImageBuffer, 320),
            displaySize: _resizeIntoWidth(rotatedImageBuffer, 640)
        }))
        .then(buffers => {
            Promise.props({
                original: gcs.uploadImageBuffer(imageName, imageFile.buffer),
                thumb: gcs.uploadImageBuffer(imageName + '--thumb', buffers.thumb),
                display: gcs.uploadImageBuffer(imageName + '--display', buffers.displaySize)
            })
            .then(uploads => resolve(uploads))
            .catch(error => reject(error));
        });
    });
};


function _resizeIntoWidth(imageBuffer, width) {
    return new Promise((resolve, reject) => {
        gm(imageBuffer)
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
        }))
    })
}

module.exports = service;
