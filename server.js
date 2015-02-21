var express = require('express');
var bodyParser = require('body-parser');
var Promise = require('bluebird');
var aws = require('aws-sdk');
var _ = require('lodash');

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


// #### Routes
//

// API
require('./api')(app);

// Catch all 404 route (this needs to be last)
app.get('*', function(req, res, next) {
    var err = new Error();
    err.status = 404;
    next(err);
});




// ## Error handlers
app.use(function handle404(err, req, res, next) { // 404
    if (err.status !== 404) return next(err);
    res.send(err.message || '404 Content not found - but such are the mysteries of the Internet sometimes');
});

app.use(function genericErrorHandler(err, req, res, next) { // 500

    if (_.isUndefined(err.status)) {
        err.status = 500;
    }

    console.log(err, req); // log the error

    res.status(err.status).send('AYBABTU'); // send response
});


// # Start the server
app.listen(3000, function() {
    console.log('Dakdak backend started at port 3000');
});
