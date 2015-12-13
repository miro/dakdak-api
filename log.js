var winston = require('winston');

var options = {
	transports: [
		new (winston.transports.Console)({ 'timestamp': true })
	]
};
module.exports = new (winston.Logger)(options);
