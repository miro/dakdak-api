var Promise 		= require('bluebird');
var db 				= require('./database');
var log             = require('./log');

var utils = {};

utils.generateUUID = (function() {
    // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
       .toString(16)
       .substring(1);
    }
    return function() {
        return s4() + s4() + s4() + s4();
    };
})();


utils.handleResult = function handleResult(result, res, next) {
    if (result) {
        try {
            res.send(result);
        }
        catch (error) {
            log.error('Error catched on handleResult');
            next(error);
        }
    }
    else {
        res.sendStatus(404);
    }
};

utils.solveTitleFromFilename = function(filename) {
    var nameParts = filename.split('.');
    nameParts.pop(); // remove extension
    return nameParts.join('-');
};

module.exports = utils;
