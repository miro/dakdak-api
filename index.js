var express         = require('express');
var bodyParser      = require('body-parser');
var Promise         = require('bluebird');
var _               = require('lodash');
var passport        = require('passport');

var config          = require('./configurator');
var api             = require('./api');
var log             = require('./log');
var authService     = require('./services/auth');

var app             = express();



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

app.use(passport.initialize());

app.set('view engine', 'jade');


// #### Routes

// Auth related
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook'),
    function(req, res) {
        console.log('auth ok!');

        res.render('auth-callback', { user: req.user.id, message: 'Hello there!'});
    }
);

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
    // TODO the err.status is always unset, this needs a custom error implementation
    if (_.isUndefined(err.status)) {
        err.status = 500;
    }

    log.error(err); // log the error
    res.status(err.status).send(err); // send response
});


// # Start the server
app.listen(5000, function() {
    log.info('Dakdak backend started at port 5000');
});
