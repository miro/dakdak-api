var Promise             = require('bluebird');
var streamifier         = require('streamifier');
var cfg                 = require('./configurator');
var log                 = require('./log');

var gcloud              = require('gcloud')({
  keyFilename: './configs/keys/dakdak-8acf328d899f.json',
  projectId: cfg.gcs.projectId
});

var gcs = gcloud.storage();
var bucket = gcs.bucket(cfg.gcs.bucketName);

var service = {};


// # API
//
// uploadImage
service.uploadImage = function uploadImageAndMakePublic(imageName, imageFile) {
    return new Promise(function(resolve, reject) {

        var file = bucket.file(imageName);

        streamifier.createReadStream(imageFile.buffer)
        .pipe(file.createWriteStream({
            metadata: { contentType: 'image/jpeg' }
        }))
        .on('error', function(error) {
            log.error('Error on GCS upload!');
            reject(error);
        })
        .on('finish', function() {
            log.debug('File uploaded succesfully to GCS! Now making it public...');
            file.makePublic(function(error, response) {
                if (error) {
                    log.error('Making file public in GCS failed!');
                    return reject(error);
                }
                log.debug('File set to public!');
                resolve(response);
            })
        });
    });
};



module.exports = service;
