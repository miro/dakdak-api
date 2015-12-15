var Promise         = require('bluebird');
var gm              = require('gm').subClass({ imageMagick: true });

var log             = require('../log');
var gcs             = require('./googleCloud');


var service = {};

service.uploadImage = function uploadImage(imageName, imageFile) {
    return new Promise((resolve, reject) => {

        if (imageFile.mimetype !== 'image/jpeg') {
            log.info('Unsupported filetype detected');
            return reject({ status: 400, message: 'Unsupported file type uploaded' });
        }

        Promise.props({
            thumb: resizeIntoWidth(imageFile.buffer, 200),
            displaySize: resizeIntoWidth(imageFile.buffer, 500)
        })
        .then(buffers => {
            Promise.props({
                original: gcs.uploadImageBuffer(imageName, imageFile.buffer),
                thumb: gcs.uploadImageBuffer(imageName + '--thumb', buffers.thumb),
                display: gcs.uploadImageBuffer(imageName + '--display', buffers.displaySize)
            })
            .then(uploads => resolve(uploads));
        });
    });
};


function resizeIntoWidth(imageBuffer, width) {
    return new Promise((resolve, reject) => {
        gm(imageBuffer)
        .resize(width)
        .toBuffer('JPG', ((error, resultBuffer) => {
            if (error) {
                return reject(error);
            }
            return resolve(resultBuffer);
        }));
    });
}


module.exports = service;
