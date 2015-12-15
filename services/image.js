var Promise         = require('bluebird');

var log             = require('../log');
var gcs             = require('./googleCloud');


var service = {};

service.uploadImage = function uploadImage(imageName, imageFile) {
    return new Promise((resolve, reject) => {

        if (imageFile.mimetype !== 'image/jpeg') {
            log.info('Unsupported filetype detected');
            return reject({ status: 400, message: 'Unsupported file type uploaded' });
        }

        return resolve(gcs.uploadImage(imageName, imageFile));
    });

};



module.exports = service;
