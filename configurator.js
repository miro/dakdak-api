var env         = process.env.DAKDAK_ENV || 'development';
var config      = require('./configs/' + env + '.js');

console.log('Configs fetched with env "' + env + '"');

config.env = env;

module.exports = config;
