var fs                  = require('fs');
var streamifier         = require('streamifier');

var gcloud              = require('gcloud')({
  keyFilename: './configs/keys/dakdak-8acf328d899f.json',
  projectId: 'dakdak-1154'
});

var gcs = gcloud.storage();
var bucket = gcs.bucket('dakdak-dev');

var service = {};


// # API
//
// uploadImage
service.uploadImage = function uploadImageAndMakePublic(imageName, imageFile) {
    var file = bucket.file(imageName);

    streamifier.createReadStream(imageFile.buffer)
    .pipe(file.createWriteStream({
        metadata: {
            contentType: 'image/jpeg',
            metadata: {
                custom: 'metadata'
            }
        }
    }))
    .on('error', function(err) {
        console.log('ERRRRROR on pipeing!');
        console.log('ERRorz', err);
    })
    .on('finish', function() {
        console.log('All good! making it public');
        file.makePublic(function(err, response) {
            console.log('File set to public!');
            (err) ? console.log(err) : 'lol';
        })
    });
};



module.exports = service;
