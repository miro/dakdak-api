var cfg = {};

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

cfg.jwt = {
    secret: 'super secret string, you should change this into something else!'
};

cfg.fb = { // Facebook config
    clientID: process.env.DAKDAK_FB_APP_ID,
    clientSecret: process.env.DAKDAK_FB_APP_SECRET,
    callbackURL: 'http://localhost:5000/auth/facebook/callback'
};



module.exports = cfg;
