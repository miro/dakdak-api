// # Imports
var jwt     = require('express-jwt');
var Promise = require('bluebird');
var _       = require('lodash');
var multer  = require('multer');

// multer init
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });


var config              = require('./configurator');
var db                  = require('./database');
var log                 = require('./log');
var imageService        = require('./services/image');

// Import controller utils functions & shortcut them
var utils               = require('./utils');
var handleResult        = utils.handleResult;
var updateItem          = utils.updateItem;
var deleteItem          = utils.deleteItem;
var generateUUID        = utils.generateUUID;


module.exports = function(app) {
    // # Basic bulk fetches
    //
    app.get('/api/v0/persons', function(req, res, next) {
        new db.models.Person().fetchAll()
        .then(function(result) { handleResult(result, res, next); });
    });
    app.get('/api/v0/spots', function(req, res, next) {
        new db.models.Spot().fetchAll()
        .then(function(result) { handleResult(result, res, next); });
    });
    app.get('/api/v0/images', function(req, res, next) {
        new db.models.Image().fetchAll()
        .then(function(result) { handleResult(result, res, next); });
    });


    // # Get single entity
    //
    // Image
    app.get('/api/v0/images/:id', function(req, res, next) {
        new db.models.Image()
        .where({ id: req.params.id })
        .fetch()
        .then(function(result) { handleResult(result, res, next); });
    });

    // # Create-operations
    //
    // Create person
    app.post('/api/v0/persons', function(req, res, next) {
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
    app.post('/api/v0/spots', function(req, res, next) {
        var spot = new db.models.Spot({
            name: req.body.name
        });
        spot.save()
        .then(function saveOk(newSpot) {
            handleResult(newSpot, res, next);
        });
    });
    // Create image
    app.post('/api/v0/images', upload.single('imageFile'), function(req, res, next) {
        var file = req.file;
        var fileStorageId = generateUUID(); // will be used as a filename

        imageService.uploadImage(fileStorageId, file)
        .then(uploadResult => {
            new db.models.Image({
                storageId: fileStorageId,
                // TODO: uploaderId
                // TODO: uploadDate?
                hasThumbnailSize: uploadResult.thumb.uploaded,
                hasDisplaySize: uploadResult.display.uploaded,

                year: req.body.year,
                month: req.body.month,
            })
            .save()
            .then(dbResult => {
                handleResult(dbResult.serialize(), res, next);
            });
        })
        .catch(error => {
            log.error('Error on image creation', error);
            next(error);
        });
    });


    // # Update-operations
    //
    // Update person
    app.put('/api/v0/persons/:id', function(req, res, next) {
        updateItem('Person', req.params.id, _.pick(req.body, 'displayName', 'fullName'))
        .then(function saveOk(model) {
            handleResult(model, res, next);
        })
        .error(function saveNotOk(error) {
            return next(new Error(error));
        });
    });
    // Update spot
    app.put('/api/v0/spots/:id', function(req, res, next) {
        var attrObj = {
            name: req.body.name,
            description: req.body.description,
            latitude: parseFloat(req.body.latitude) || 0.0,
            longitude: parseFloat(req.body.longitude) ||  0.0
        };

        updateItem('Spot', req.params.id, attrObj)
        .then(function saveOk(model) {
            handleResult(model, res, next);
        })
        .error(function saveNotOk(error) {
            return next(new Error(error));
        });
    });
    // Update image
    app.put('/api/v0/images/:id', function(req, res, next) {

        var attrObj = _.pick(req.body, 
            'title', 'trickName', 'description', 'date', 'riderId', 'photographerId', 'spotId', 'published',
            'year', 'month', 'day'
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
    app.delete('/api/v0/persons/:id', function(req, res, next) {
        deleteItem('Person', req.params.id)
        .then(function deleteOk() {
            res.sendStatus(200);
        })
        .error(function deleteNotOk(error) {
            return next(new Error(error));
        });
    });

    // Delete spot
    app.delete('/api/v0/spots/:id', function(req, res, next) {
        deleteItem('Spot', req.params.id)
        .then(function deleteOk() {
            res.sendStatus(200);
        })
        .error(function deleteNotOk(error) {
            return next(new Error(error));
        });
    });

    // Delete image
    app.delete('/api/v0/images/:id', function(req, res, next) {
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
