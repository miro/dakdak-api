var env         = process.env.NODE_ENV || 'development';
var configFile   = require('./configs/' + env + '.js');

console.log('Configs fetched with env "' + env + '"');

module.exports = {
    environment: 	env,
    dbConfig: 		configFile.dbConfig,
    gcs: 		configFile.gcsConfig
};
