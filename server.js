var express = require('express');
var bodyParser = require('body-parser');

var Promise = require('bluebird');
var _ = require('lodash');

var app = express();
var config = require('./configurator.js');
var api = require('./api.js');


// ### Config

// # Express middleware
app.use(function allowCrossDomain(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // HOX dev solution
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse json


// #### Routes

// API
require('./api')(app);

// Catch all 404 route (this needs to be last)
app.get('*', function(req, res, next) {
    var err = new Error();
    err.status = 404;
    next(err);
});



// ### Error handlers
app.use(function handle404(err, req, res, next) { // 404
    if (err.status !== 404) return next(err);
    res.send(err.message || '404 Content not found - but such are the mysteries of the Internet sometimes');
});

app.use(function genericErrorHandler(err, req, res, next) { // 500
    if (_.isUndefined(err.status)) {
        err.status = 500;
    }

    console.log(err); // log the error

    res.status(err.status).send(err); // send response
});


// # Start the server
app.listen(5000, function() {
    console.log('Dakdak backend started at port 5000');
});
