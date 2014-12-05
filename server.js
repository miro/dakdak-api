var express = require('express');
var bodyParser = require('body-parser');
var Promise = require('bluebird');

var app = express();
var db = require('./database.js');


// # Express middleware
app.use(function allowCrossDomain(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // hox fix url
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse json



// # Routes
app.get('/api/persons', function(req, res) {
    new db.models.Person().fetchAll()
    .then(function(images) {
        res.send(images.toJSON());
    }).catch(function(error) {
        console.log(error);
        res.send('An error occured');
    });
});


app.post('/api/person', function(req, res) {
    var person = new db.models.Person({
        fullName: req.body.fullName,
        displayName: req.body.displayName
    });
    person.save();

    res.send(person.toJSON());
});





// # Start the server
app.listen(3000, function() {
    console.log('Dakdak backend started at port 3000');
});
