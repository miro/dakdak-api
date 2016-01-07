'use strict';

var passport                = require('passport');
var FacebookStrategy        = require('passport-facebook');

var userController          = require('../controllers/user');
var log                     = require('../log');
var config                  = require('../configurator');

// NOTE https://github.com/jaredhanson/passport-google-oauth/pull/81

var facebookCfg = config.fb;
facebookCfg.profileFields = ['id', 'email', 'displayName']; // what fields to fetch from Facebook

// these are required for Passport to work
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new FacebookStrategy(facebookCfg, (accessToken, refreshToken, profile, done) => {
    log.debug('Auth ok from Facebook! Syncing with our own database...');
    userController.getOrCreate('facebook', profile.id, profile)
    .then(userModel => {
        log.debug('User created/fetched', userModel.id);
        done(null, userModel);
    });
}));
