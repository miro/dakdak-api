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
    baseUrl: 'https://storage.googleapis.com'
};

cfg.jwt = {
    secret: 'super secret string, you should change this into something else!'
};


module.exports = cfg;
