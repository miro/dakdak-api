var cfg = {};

cfg.deployUrl = 'http://localhost:5000';
cfg.frontendUrl = 'http://localhost:3000';

cfg.dbConfig = {
    client: 'postgresql',
    connection: {
        host: 'localhost',
        user: 'dakdak',
        port: 5432,
        password: 'dakdak',
        database: 'dakdak',
        charset: 'utf8'
    }
};

cfg.gcs = {
    projectId: 'dakdak-1154',
    bucketName: 'dakdak-dev',
    baseUrl: 'https://storage.googleapis.com',
    keyFilename: __dirname + '/keys/dakdak-gcs-storage-key.json'
};

cfg.googleAuth = require('./keys/google-oauth-credentials.js');
cfg.googleAuth.callbackURL = cfg.deployUrl + '/auth/google/callback';

cfg.jwt = {
    secret: 'super secret string, you should change this into something else!'
};

cfg.fb = { // Facebook config
    clientID: process.env.DAKDAK_FB_APP_ID,
    clientSecret: process.env.DAKDAK_FB_APP_SECRET,
    callbackURL: cfg.deployUrl + '/auth/facebook/callback'
};



module.exports = cfg;
