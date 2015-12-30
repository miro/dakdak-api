var passport                = require('passport');
var FacebookStrategy        = require('passport-facebook');

var log                     = require('../log');


// Check that required keys are set

const facebookCfg = {
    clientID: process.env.DAKDAK_FB_APP_ID,
    clientSecret: process.env.DAKDAK_FB_APP_SECRET,
    callbackURL: 'http://localhost:5000/auth/facebook/callback' // TODO parameterize
};


passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new FacebookStrategy(facebookCfg, function (accessToken, refreshToken, profile, done) {
    console.log('Auth OK!', profile.id);
    done(null, profile);
}));
