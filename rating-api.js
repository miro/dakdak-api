'use strict';
const express                 = require('express');

const handleResult            = require('./utils').handleResult;
const ratingController        = require('./controllers/rating');


const router = express.Router();

// # Auth
router.use(function validateRatingRequest(req, res, next) {
    // TODO implement some basic header check
    console.log(res.headers);

    const deviceId = req.get('x-device-id');
    if (!deviceId) {
        let error = new Error('No device id on the request');
        error.status = 400;
        next(error);
    } else {
        req.deviceId = deviceId;
        next();
    }
});


// # Routes
//
router.get('/', function(req, res, next) {
    handleResult(ratingController.getList(req.deviceId), res, next);
});

router.put('/:ratingId', function(req, res, next) {
    handleResult(
        ratingController.rate(req.deviceId, req.ratingId, req.body.betterImageId),
        res,
        next
    );
});

module.exports = router;
