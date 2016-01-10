'use strict';

var passport                = require('passport');
var FacebookStrategy        = require('passport-facebook');
var GoogleStrategy          = require('passport-google-oauth').OAuth2Strategy;

var userController          = require('../controllers/user');
var log                     = require('../log');
var config                  = require('../configurator');

// these are required for Passport to work
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));



// # Facebook
var facebookCfg = config.fb;
facebookCfg.profileFields = ['id', 'email', 'displayName']; // what fields to fetch from Facebook


passport.use(new FacebookStrategy(facebookCfg, (accessToken, refreshToken, profile, done) => {
    log.debug('Auth ok from Facebook! Syncing with our own database...');
    userController.getOrCreate('facebook', profile.id, profile)
    .then(userModel => {
        log.debug('User created/fetched via Facebook', userModel.id);
        done(null, userModel);
    });
}));


// # Google
// NOTE https://github.com/jaredhanson/passport-google-oauth/pull/81
passport.use(new GoogleStrategy(config.googleAuth,
  function(accessToken, refreshToken, profile, done) {
    log.debug('Auth OK from Google! Syncing with our database...', profile);

    userController.getOrCreate('google', profile.id, profile)
    .then(userModel => {
        log.debug('User created/fetched via Google', userModel.id);
        done(null, userModel);
    });
  }
));
