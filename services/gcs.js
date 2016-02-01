var Promise             = require('bluebird');
var streamifier         = require('streamifier');
var cfg                 = require('../configurator');
var log                 = require('../log');

var gcloud              = require('gcloud')(cfg.gcs);

var gcs = gcloud.storage();
var bucket = gcs.bucket(cfg.gcs.bucketName);

var service = {};


// # API
//
// uploadImage
service.uploadImageBuffer = function uploadImageAndMakePublic(imageName, imageBuffer) {
    return new Promise(function(resolve, reject) {
        var file = bucket.file(imageName);

        log.info('Starting GCS upload for', imageName);

        streamifier.createReadStream(imageBuffer)
        .pipe(file.createWriteStream({
            metadata: { contentType: 'image/jpeg' }
        }))
        .on('error', function(error) {
            log.error('Error on GCS upload!');
            reject(error);
        })
        .on('finish', function() {
            log.debug('File', imageName, 'uploaded succesfully to GCS! Now making it public...');

            file.makePublic(function(error, response) {
                if (error) {
                    log.error('Making file public in GCS failed!');
                    return reject(error);
                }
                log.debug('File', imageName, 'set to public!');
                resolve({
                    imageName,
                    uploaded: true
                });
            })
        });
    });
};



module.exports = service;
