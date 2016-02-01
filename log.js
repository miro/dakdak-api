var winston = require('winston');

var options = {
	level: 'debug',
	transports: [
		new (winston.transports.Console)({ 'timestamp': true })
	]
};
module.exports = new (winston.Logger)(options);
