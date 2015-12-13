// # Imports
var jwt     = require('express-jwt');
var Promise = require('bluebird');
var _       = require('lodash');



var config = require('./configurator');
var db = require('./database');
module.exports = function(app) {
    // # Basic bulk fetches
    //
    app.get('/api/v0/person', function(req, res, next) {
        new db.models.Person().fetchAll()
        .then(function(result) { _handleResult(result, res, next); });
    });
    app.get('/api/v0/spot', function(req, res, next) {
        new db.models.Spot().fetchAll()
        .then(function(result) { _handleResult(result, res, next); });
    });
    app.get('/api/v0/image', function(req, res, next) {
        new db.models.Image().fetchAll()
        .then(function(result) { _handleResult(result, res, next); });
    });


    // # Get single entity
    //
    // Image
    app.get('/api/v0/image/:id', function(req, res, next) {
        new db.models.Image()
        .where({ id: req.params.id })
        .fetch()
        .then(function(result) { _handleResult(result, res, next); });
    });

    // # Create-operations
    //
    // Create person
    app.post('/api/v0/person', function(req, res, next) {
        var person = new db.models.Person({
            fullName: req.body.fullName,
            displayName: req.body.displayName
        });
        person.save()
        .then(function saveOk(newPerson) {
            _handleResult(newPerson, res, next);
        });
    });
    // Create spot
    app.post('/api/v0/spot', function(req, res, next) {
        var spot = new db.models.Spot({
            name: req.body.name
        });
        spot.save()
        .then(function saveOk(newSpot) {
            _handleResult(newSpot, res, next);
        });
    });
    // Create image
    app.post('/api/v0/image', function(req, res, next) {
        new db.models.Image({ s3id: req.body.s3id })
        .save()
        .then(function saveOk(newImg) {
            _handleResult(newImg, res, next);
        });
    });



    // # Update-operations
    //
    // Update person
    app.put('/api/v0/person/:id', function(req, res, next) {
        console.log(req.body);

        _updateItem('Person', req.params.id, _.pick(req.body, 'displayName', 'fullName'))
        .then(function saveOk(model) {
            _handleResult(model, res, next);
        })
        .error(function saveNotOk(error) {
            return next(new Error(error));
        });
    });
    // Update spot
    app.put('/api/v0/spot/:id', function(req, res, next) {
        var attrObj = {
            name: req.body.name,
            location_search_string: req.body.location_search_string,
            latitude: parseFloat(req.body.latitude) || 0.0,
            longitude: parseFloat(req.body.longitude) ||  0.0
        };
        console.log(attrObj);

        _updateItem('Spot', req.params.id, attrObj)
        .then(function saveOk(model) {
            _handleResult(model, res, next);
        })
        .error(function saveNotOk(error) {
            return next(new Error(error));
        });
    });
    // Update image
    app.put('/api/v0/image/:id', function(req, res, next) {

        var attrObj = _.pick(req.body, 
            'trickName', 'description', 'date', 'riderId', 'photographerId', 'spotId', 'published'
        );

        _updateItem('Image', req.params.id, attrObj)
        .then(function saveOk(model) {
            _handleResult(model, res, next);
        })
        .error(function saveNotOk(error) {
            return next(new Error(error));
        });
    });



    // # Delete-operations
    //
    // Delete person
    app.delete('/api/v0/person/:id', function(req, res, next) {
        _deleteItem('Person', req.params.id)
        .then(function deleteOk() {
            res.sendStatus(200);
        })
        .error(function deleteNotOk(error) {
            return next(new Error(error));
        });
    });

    // Delete spot
    app.delete('/api/v0/spot/:id', function(req, res, next) {
        _deleteItem('Spot', req.params.id)
        .then(function deleteOk() {
            res.sendStatus(200);
        })
        .error(function deleteNotOk(error) {
            return next(new Error(error));
        });
    });

    // Delete image
    app.delete('/api/v0/image/:id', function(req, res, next) {
        _deleteItem('Image', req.params.id)
        .then(function deleteOk() {
            res.sendStatus(200);
        })
        .error(function deleteNotOk(error) {
            return next(new Error(error));
        });
    });


    // # Debugging
    app.post('/api/v0/echo', function(req, res, next) {
        console.log(req.body);
        console.log(req.params);

        _handleResult({ body: req.body, params: req.params }, res, next);
    });
}

// ### Utility functions
var _generateUUID = (function() {
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


var _handleResult = function _handleResult(result, res, next) {

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


var _deleteItem = function(type, id) {
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


var _updateItem = function(type, id, newAttrs, res, next) {
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
