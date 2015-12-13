// # Imports
var jwt     = require('express-jwt');
var Promise = require('bluebird');
var _       = require('lodash');
var multer  = require('multer');

// multer init
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })


var config      = require('./configurator');
var db          = require('./database');
var gcs         = require('./googleCloud');

// Import controller utils functions & shortcut them
var utils       = require('./utils');
var handleResult = utils.handleResult;
var updateItem = utils.updateItem;
var deleteItem = utils.deleteItem;
var generateUUID = utils.generateUUID;


module.exports = function(app) {
    // # Basic bulk fetches
    //
    app.get('/api/v0/person', function(req, res, next) {
        new db.models.Person().fetchAll()
        .then(function(result) { handleResult(result, res, next); });
    });
    app.get('/api/v0/spot', function(req, res, next) {
        new db.models.Spot().fetchAll()
        .then(function(result) { handleResult(result, res, next); });
    });
    app.get('/api/v0/image', function(req, res, next) {
        new db.models.Image().fetchAll()
        .then(function(result) { handleResult(result, res, next); });
    });


    // # Get single entity
    //
    // Image
    app.get('/api/v0/image/:id', function(req, res, next) {
        new db.models.Image()
        .where({ id: req.params.id })
        .fetch()
        .then(function(result) { handleResult(result, res, next); });
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
            handleResult(newPerson, res, next);
        });
    });
    // Create spot
    app.post('/api/v0/spot', function(req, res, next) {
        var spot = new db.models.Spot({
            name: req.body.name
        });
        spot.save()
        .then(function saveOk(newSpot) {
            handleResult(newSpot, res, next);
        });
    });
    // Create image
    app.post('/api/v0/image', upload.single('imageFile'), function(req, res, next) {
        // new db.models.Image({ s3id: req.body.s3id })
        // .save()
        // .then(function saveOk(newImg) {

        // });

        console.log(req.file);

        handleResult({ lolz: true }, res, next);
        gcs.uploadImage('pic-' + generateUUID(), req.file);
    });


    // # Update-operations
    //
    // Update person
    app.put('/api/v0/person/:id', function(req, res, next) {
        updateItem('Person', req.params.id, _.pick(req.body, 'displayName', 'fullName'))
        .then(function saveOk(model) {
            handleResult(model, res, next);
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

        updateItem('Spot', req.params.id, attrObj)
        .then(function saveOk(model) {
            handleResult(model, res, next);
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

        updateItem('Image', req.params.id, attrObj)
        .then(function saveOk(model) {
            handleResult(model, res, next);
        })
        .error(function saveNotOk(error) {
            return next(new Error(error));
        });
    });



    // # Delete-operations
    //
    // Delete person
    app.delete('/api/v0/person/:id', function(req, res, next) {
        deleteItem('Person', req.params.id)
        .then(function deleteOk() {
            res.sendStatus(200);
        })
        .error(function deleteNotOk(error) {
            return next(new Error(error));
        });
    });

    // Delete spot
    app.delete('/api/v0/spot/:id', function(req, res, next) {
        deleteItem('Spot', req.params.id)
        .then(function deleteOk() {
            res.sendStatus(200);
        })
        .error(function deleteNotOk(error) {
            return next(new Error(error));
        });
    });

    // Delete image
    app.delete('/api/v0/image/:id', function(req, res, next) {
        deleteItem('Image', req.params.id)
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

        handleResult({ body: req.body, params: req.params }, res, next);
    });
}

// ### Utility functions

