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

        gm(imageFile.buffer)
        .resize(100)
        .toBuffer('JPG', ((error, buffer) => {
            if (error) {
                return reject(error);
            }
            console.log('jyh', buffer);
            return resolve(gcs.uploadImageBuffer(imageName + '-small', buffer));
        }));
    });
};



module.exports = service;
