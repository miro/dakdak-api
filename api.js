// # Imports
var Promise = require('bluebird');
var _       = require('lodash');
var multer  = require('multer');

var config              = require('./configurator');
var db                  = require('./database');
var log                 = require('./log');
var imageService        = require('./services/image');
var modelController     = require('./controllers/model');
var utils               = require('./utils');


// multer init
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

// Shortcuts for utils functions
var handleResult        = utils.handleResult;
var generateUUID        = utils.generateUUID;


module.exports = function(app) {
    // # Basic bulk fetches
    //
    app.get('/api/v0/persons', function(req, res, next) {
        modelController.getAll('Person')
        .then(result => handleResult(result, res, next));
    });
    app.get('/api/v0/spots', function(req, res, next) {
        modelController.getAll('Spot')
        .then(result => handleResult(result, res, next));
    });
    app.get('/api/v0/images', function(req, res, next) {
        modelController.getAll('Image')
        .then(result => handleResult(result, res, next));
    });


    // # Get single entity
    //
    // Image
    app.get('/api/v0/images/:id', function(req, res, next) {
        modelController.getSingle('Image', { id: req.params.id })
        .then(result => handleResult(result, res, next));
    });



    // # Create-operations
    //

    // Create person
    app.post('/api/v0/persons', function(req, res, next) {
        modelController.create('Person', {
            fullName: req.body.fullName,
            displayName: req.body.displayName
        })
        .then(function saveOk(newPerson) {
            handleResult(newPerson, res, next);
        });
    });

    // Create spot
    app.post('/api/v0/spots', function(req, res, next) {
        modelController.create('Spot', {
            name: req.body.name
        })
        .then(function saveOk(newSpot) {
            handleResult(newSpot, res, next);
        });
    });

    // Create (upload) image
    app.post('/api/v0/images', upload.single('imageFile'), function(req, res, next) {
        var file = req.file;

        var fileStorageId = generateUUID(); // will be used as a filename
        var defaultTitle = utils.solveTitleFromFilename(file.originalname);

        imageService.uploadImage(fileStorageId, file)
        .then(uploadResult => {
            modelController.create('Image', {
                storageId: fileStorageId,
                uploaderId: req.user.id,
                // TODO: uploadDate?
                hasThumbnailSize: uploadResult.thumb.uploaded,
                hasDisplaySize: uploadResult.display.uploaded,

                year: req.body.year,
                month: req.body.month,
                title: defaultTitle
            })
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
        modelController.update('Person', req.params.id, _.pick(req.body, 'displayName', 'fullName'))
        .then(newProps => handleResult(newProps, res, next))
        .error(error => next(new Error(error)));
    });

    // Update spot
    app.put('/api/v0/spots/:id', function(req, res, next) {
        modelController.update('Spot', req.params.id, {
            name: req.body.name,
            description: req.body.description,
            latitude: parseFloat(req.body.latitude) || 0.0,
            longitude: parseFloat(req.body.longitude) ||  0.0
        })
        .then(newProps => handleResult(newProps, res, next))
        .error(error => next(new Error(error)));
    });

    // Update image
    app.put('/api/v0/images/:id', function(req, res, next) {
        var props = _.pick(req.body,
            'title', 'trickName', 'description', 'date', 'riderId', 'photographerId', 'spotId', 'published',
            'year', 'month', 'day'
        );


        // Set empty strings to null
        // (since frontend might pass some of the integer fields as string, this allows unsetting those)
        // fields - otherwise DB barfs up
        for (var prop in props) {
            if (_.isString(props[prop])) {
                props[prop] = (props[prop].length > 0) ? props[prop] : null;
            }
        }

        modelController.update('Image', req.params.id, props)
        .then(newProps => handleResult(newProps, res, next))
        .error(error => next(new Error(error)));
    });



    // # Delete-operations
    //
    // Delete person
    app.delete('/api/v0/persons/:id', function(req, res, next) {
        modelController.delete('Person', req.params.id)
        .then(() => res.sendStatus(200))
        .error(error => next(new Error(error)));
    });

    // Delete spot
    app.delete('/api/v0/spots/:id', function(req, res, next) {
        modelController.delete('Spot', req.params.id)
        .then(() => res.sendStatus(200))
        .error(error => next(new Error(error)));
    });

    // Delete image
    app.delete('/api/v0/images/:id', function(req, res, next) {
        modelController.delete('Image', req.params.id)
        .then(() => res.sendStatus(200))
        .error(error => next(new Error(error)));
    });


    // # Debugging
    app.post('/api/v0/echo', function(req, res, next) {
        console.log(req.body);
        console.log(req.params);

        handleResult({ body: req.body, params: req.params }, res, next);
    });
};
