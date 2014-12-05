var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Promise = require('bluebird');

var Model = require('./database.js')



var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
};

app.use(allowCrossDomain); // cors
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse json


// parse application/vnd.api+json as json
app.use(bodyParser.json({type: 'application/vnd.api+json'}));

// elsewhere, to use the bookshelf client:
var bookshelf = app.get('bookshelf');

// {our model definition code goes here}

// Start the server
app.listen(3000, function() {
    console.log('Dakdak backend started at port 3000');
});

