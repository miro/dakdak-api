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

cfg.gcsConfig = {
    projectId: 'dakdak-1154',
    bucketName: 'dakdak-dev',
    baseUrl: 'https://storage.googleapis.com'
};


module.exports = cfg;
