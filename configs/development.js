var dbConfig = {
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

var s3Config = {
    bucket: 'dakdak'
    key: '',
    secret: ''
};


module.exports = {
    dbConfig: dbConfig,
    s3Config: s3Config
};
