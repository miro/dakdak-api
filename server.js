var express = require('express');
var bodyParser = require('body-parser');
var Promise = require('bluebird');
var aws = require('aws-sdk');

var app = express();
var db = require('./database.js');
var config = require('./configurator.js');
var api = require('./api.js');


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






// #### API
require('./api')(app);





// # Start the server
app.listen(3000, function() {
    console.log('Dakdak backend started at port 3000');
});
