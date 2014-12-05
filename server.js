var express = require('express');
var bodyParser = require('body-parser');
var Promise = require('bluebird');

var app = express();
var DB = require('./database.js');


// Express middleware
app.use(function allowCrossDomain(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse json






// Start the server
app.listen(3000, function() {
    console.log('Dakdak backend started at port 3000');
});
