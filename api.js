// # Imports
var Promise = require('bluebird');
var _       = require('lodash');
var multer  = require('multer');

var config              = require('./configurator');
var db                  = require('./database');
var log                 = require('./log');
var utils               = require('./utils');

var tokenService            = require('./services/token');
var roleService             = require('./services/role');

var modelController         = require('./controllers/model');
var imageController         = require('./controllers/image');
var invitationController    = require('./controllers/invitation');
var kpiController           = require('./controllers/kpi');


// multer init
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

// Shortcuts
var handleResult        = utils.handleResult;
var requiredRole        = roleService.requiredRoleMiddleware;
var roles               = roleService.roles;


module.exports = function(app) {
    // # "Key Performance Indicator"
    // requires no authentication
    app.get('/api/v0/kpi', function(req, res, next) {
        handleResult(kpiController.getKpi(), res, next);
    });

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



    // # Create-operations
    //
    // Create person
    app.post('/api/v0/persons', requiredRole(roles.EDITOR), function(req, res, next) {
        modelController.create('Person', {
            fullName: req.body.fullName,
            displayName: req.body.displayName
        })
        .then(function saveOk(newPerson) {
            handleResult(newPerson, res, next);
        });
    });

    // Create spot
    app.post('/api/v0/spots', requiredRole(roles.EDITOR), function(req, res, next) {
        modelController.create('Spot', {
            name: req.body.name,
            description: req.body.description
        })
        .then(function saveOk(newSpot) {
            handleResult(newSpot, res, next);
        });
    });

    // Create (upload) image
    app.post('/api/v0/images', upload.single('imageFile'), function(req, res, next) {
        imageController.create(req.file, req.user, req.body)
        .then(dbResult => {
            kpiController.updateKpi();
            handleResult(dbResult.serialize(), res, next);
        })
        .catch(error => {
            log.error('Error on image creation', error);
            next(error);
        });
    });



    // # Update-operations
    //
    // Update person
    app.put('/api/v0/persons/:id', requiredRole(roles.EDITOR), function(req, res, next) {
        modelController.update('Person', req.params.id, _.pick(req.body, 'displayName', 'fullName'))
        .then(newProps => handleResult(newProps, res, next))
        .error(error => next(new Error(error)));
    });

    // Update spot
    app.put('/api/v0/spots/:id', requiredRole(roles.EDITOR), function(req, res, next) {
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
    // TODO: for normal users allow updating only images uploaded by user or the user organisation
    app.put('/api/v0/images/:id', requiredRole(roles.EDITOR), function(req, res, next) {
        var props = _.pick(req.body,
            'title', 'trickName', 'description', 'date', 'riderId', 'photographerId', 'spotId', 'published',
            'year', 'month', 'day'
        );
        props = utils.setEmptyStringsNull(props);

        modelController.update('Image', req.params.id, props)
        .then(newProps => handleResult(newProps, res, next))
        .error(error => next(new Error(error)));
    });



    // # Delete-operations
    //
    // Delete person
    app.delete('/api/v0/persons/:id', requiredRole(roles.ADMIN), function(req, res, next) {
        modelController.delete('Person', req.params.id)
        .then(() => res.sendStatus(200))
        .error(error => next(new Error(error)));
    });

    // Delete spot
    app.delete('/api/v0/spots/:id', requiredRole(roles.ADMIN), function(req, res, next) {
        modelController.delete('Spot', req.params.id)
        .then(() => res.sendStatus(200))
        .error(error => next(new Error(error)));
    });

    // Delete image
    app.delete('/api/v0/images/:id', requiredRole(roles.ADMIN), function(req, res, next) {
        modelController.delete('Image', req.params.id)
        .then(() => res.sendStatus(200))
        .error(error => next(new Error(error)));
    });



    // # Invitation codes
    //
    // Check invitation
    app.post('/api/v0/invitation', function(req, res, next) {
        invitationController.checkInvitation(req.body.invitationCode, req.user)
        .then((updatedUserModel) => handleResult({
                userProfile: updatedUserModel.serialize(),
                newToken: tokenService.getToken(updatedUserModel)
        }, res, next))
        .catch(error => next(error));
    });


    // # Debugging
    app.post('/api/v0/echo', function(req, res, next) {
        console.log(req.body);
        console.log(req.params);

        handleResult({ body: req.body, params: req.params }, res, next);
    });
};
