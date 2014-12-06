var express = require('express');
var bodyParser = require('body-parser');
var Promise = require('bluebird');
var aws = require('aws-sdk');

var app = express();
var db = require('./database.js');
var config = require('./config.js');


// ### Config

// # Express middleware
app.use(function allowCrossDomain(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // hox fix url
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse json

// # S3 setup
aws.config.update({accessKeyId: config.s3Config.key, secretAccessKey: config.s3Config.secret });


// ### Utility functions
var _generateUUID = (function() {
    // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
       .toString(16)
       .substring(1);
    }
    return function() {
        return s4() + s4() + s4() + s4();
    };
})();






// #### Routes

// # Person
app.get('/api/persons', function(req, res) {
    new db.models.Person().fetchAll()
    .then(function(images) {
        res.send(images.toJSON());
    }).catch(function(error) {
        console.log(error);
        res.send('An error occured');
    });
});

app.post('/api/person', function(req, res) {
    var person = new db.models.Person({
        fullName: req.body.fullName,
        displayName: req.body.displayName
    });
    person.save();

    res.send(person.toJSON());
});

// # S3
app.get('/api/s3link', function(req, res){
    var objectUUID = _generateUUID();

    var s3 = new aws.S3(); 
    var s3_params = { 
        Bucket: config.s3Config.bucket, 
        Key: objectUUID,
        Expires: 60, 
        ContentType: req.query.s3_object_type, 
        ACL: 'public-read'
    }; 
    s3.getSignedUrl('putObject', s3_params, function(err, data){ 
        if (err){ 
            console.log(err); 
        }
        else { 
            var return_data = {
                signed_request: data,
                url: 'https://'+ config.s3Config.bucket +'.s3.amazonaws.com/' + objectUUID 
            };
            res.write(JSON.stringify(return_data));
            res.end();
        } 
    });
});




// # Start the server
app.listen(3000, function() {
    console.log('Dakdak backend started at port 3000');
});
