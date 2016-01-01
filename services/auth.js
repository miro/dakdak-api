'use strict';

var passport                = require('passport');
var FacebookStrategy        = require('passport-facebook');

var userController          = require('../controllers/user');
var log                     = require('../log');

const facebookCfg = {
    clientID: process.env.DAKDAK_FB_APP_ID,
    clientSecret: process.env.DAKDAK_FB_APP_SECRET,
    callbackURL: 'http://localhost:5000/auth/facebook/callback', // TODO parameterize
    profileFields: ['id', 'email', 'displayName'] // what fields to fetch from Facebook
};

// these are required for Passport to work
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new FacebookStrategy(facebookCfg, (accessToken, refreshToken, profile, done) => {
    log.debug('Auth ok from Facebook! Syncing with our own database...');

    userController.getOrCreate('facebook', profile.id)
    .then(userModel => {
        log.debug('User created/fetched', userModel.id);
        done(null, userModel);
    });
}));
