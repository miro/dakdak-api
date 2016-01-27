'use strict';

var express         = require('express');
var bodyParser      = require('body-parser');
var Promise         = require('bluebird');
var _               = require('lodash');
var passport        = require('passport');
var jwt             = require('express-jwt');
var http            = require('http');

var config          = require('./configurator');
var api             = require('./api');
var log             = require('./log');
var authService     = require('./services/auth');
var tokenService    = require('./services/token');

var app             = express();



// ### Config

var serverPort = process.env.PORT || 5000;

// # Express middleware
app.use(function allowCrossDomain(req, res, next) {
    res.header('Access-Control-Allow-Origin', config.frontendUrl);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse json

app.use(passport.initialize());
app.use(jwt({ secret: config.jwt.secret }).unless({
    // list of paths which require no JWT token
    path: [
        '/auth/facebook', '/auth/facebook/callback',
        '/auth/google', '/auth/google/callback',
        '/favicon.ico',
        '/api/v0/kpi',
        '/api/v0/echo'
    ]
}));

app.set('view engine', 'jade');


// #### Routes

// ## Auth related
// TODO: move these to some utility function inside authService?
// Facebook
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));
app.get('/auth/facebook/callback',
    passport.authenticate('facebook'),
    function(req, res) {
        var user = req.user;
        var token = tokenService.getToken(user);
        log.debug('Auth OK via Facebook!', user);

        res.render('auth-callback', { token, user, frontendUrl: config.frontendUrl });
    }
);

// Google
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback',
    passport.authenticate('google'),
    function(req, res) {
        var user = req.user;
        var token = tokenService.getToken(user);
        log.debug('Auth OK via Google!', user);

        res.render('auth-callback', { token, user, frontendUrl: config.frontendUrl });
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


app.use(function errorLogger(err, req, res, next) {
    const status = err.status ? err.status : 500;

    if (status >= 400) {
        log.error('Request headers:');
        log.error(JSON.stringify(req.headers));
        log.error('Request body:');
        log.error(JSON.stringify(req.body));
    }

    if (config.env === 'test' && status >= 500 ||
        config.env === 'development') {
        console.log(err.stack);
    }

    next(err);
});

app.use(function errorResponder(err, req, res, next) {
    const status = err.status ? err.status : 500;
    const httpMessage = http.STATUS_CODES[status];

    let message;
    if (status < 500) {
        message = httpMessage + ': ' + err.message;
    } else {
        message = httpMessage;
    }

    let response = {message: message};
    if (err.data) {
        response.errors = err.data;
    }

    res.status(status);
    res.send(response);
});


// # Start the server
app.listen(serverPort, function() {
    log.info('Dakdak backend started at port', serverPort);
});
