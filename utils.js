var Promise 		= require('bluebird');
var db 				= require('./database');

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


utils.handleResult = function _handleResult(result, res, next) {
    if (result) {
        try {
            res.send(result);
        }
        catch (error) {
            console.error('Error catched on handleResult');
            return next(new Error(error));
        }
    }
    else {
        res.sendStatus(404);
    }
}


utils.deleteItem = function(type, id) {
    return new Promise(function(resolve, reject) {

        new db.models[type]({ id: id })
        .fetch({ require: true })
        .then(function(model) {
            if (model) {
                model.destroy()
                .then(function destroyOk() {
                    resolve();
                });
            }
            else {
                reject('Model not found');
            }
        })
        .catch(function(error) {
            console.log('Catch on _deleteItem Pokemon block', error);
            reject(error);
        });
    });
};


utils.updateItem = function(type, id, newAttrs, res, next) {
    return new Promise(function(resolve, reject) {
        new db.models[type]({ id: id })
        .fetch({ require: true })
        .then(function (model) {
            model.save(newAttrs, { patch: true })
            .then(function saveOk(newModel) {
                resolve(newModel);
            })
            .error(function saveNotOk(error) {
                reject(error);
            });
        });
    });
};


module.exports = utils;
