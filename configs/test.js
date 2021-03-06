var cfg = {};

cfg.deployUrl = process.env.DAKDAK_DEPLOY_URL;
cfg.frontendUrl = process.env.DAKDAK_FRONTEND_URL;

cfg.dbConfig = process.env.DATABASE_URL;

cfg.gcs = {
    bucketName: process.env.DAKDAK_BUCKET_NAME,
    baseUrl: 'https://storage.googleapis.com',

    "type": process.env.DAKDAK_GCS_TYPE,
    projectId: process.env.DAKDAK_GCS_PROJECT_ID,
    "project_id": process.env.DAKDAK_GCS_PROJECT_ID,
    "private_key_id": process.env.DAKDAK_GCS_PRIVATE_KEY_ID,
    "private_key": process.env.DAKDAK_GCS_PRIVATE_KEY,
    "client_email": process.env.DAKDAK_GCS_CLIENT_EMAIL,
    "client_id": process.env.DAKDAK_GCS_CLIENT_ID,
    "auth_uri": process.env.DAKDAK_GCS_AUTH_URI,
    "token_uri": process.env.DAKDAK_GCS_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.DAKDAK_GCS_AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": process.env.DAKDAK_GCS_CLIENT_X509_CERT_URL,

    credentials: {
        "private_key": process.env.DAKDAK_GCS_PRIVATE_KEY,
        "client_email": process.env.DAKDAK_GCS_CLIENT_EMAIL
    }
};

cfg.googleAuth = {
    clientID: process.env.DAKDAK_GOOGLEAUTH_CLIENTID,
    clientSecret: process.env.DAKDAK_GOOGLEAUTH_SECRET,
    callbackURL: cfg.deployUrl + '/auth/google/callback'
};

cfg.jwt = { secret: process.env.DAKDAK_JWT_SECRET };

cfg.fb = { // Facebook config
    clientID: process.env.DAKDAK_FB_APP_ID,
    clientSecret: process.env.DAKDAK_FB_APP_SECRET,
    callbackURL: cfg.deployUrl + '/auth/facebook/callback'
};


module.exports = cfg;
