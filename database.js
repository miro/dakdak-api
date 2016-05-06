var config              = require('./configurator.js');

var knex                = require('knex')(config.dbConfig);
var bookshelf           = require('bookshelf')(knex);
var _                   = require('lodash');




// # Define models
// TODO: move to schema.js?
var models = {};

models.Image = bookshelf.Model.extend({
    tableName: 'images',
    uploader: function() {
        return this.belongsTo(models.User, 'uploaderId');
    },
    rider: function() {
        return this.belongsTo(models.Person, 'riderId');
    },
    photographer: function() {
        return this.belongsTo(models.Person, 'photographerId');
    },
    spot: function() {
        return this.belongsTo(models.Spot, 'spotId');
    },
    organisation: function() {
        return this.belongsTo(models.Organisation, 'organisationId').through(models.User, 'uploaderId');
    }
});
models.Invitation = bookshelf.Model.extend({
    tableName: 'invitations'
});
models.Person = bookshelf.Model.extend({
    tableName: 'persons'
});
models.Spot = bookshelf.Model.extend({
    tableName: 'spots'
});
models.User = bookshelf.Model.extend({
    tableName: 'users',
    images: function() {
        return this.hasMany(models.Image, 'uploaderId');
    }
});
models.Organisation = bookshelf.Model.extend({
    tableName: 'organisations',
    images: function() {
        return this.hasMany(models.Image, 'organisationId').through(models.User, 'uploaderId');
    }
});
models.Rating = bookshelf.Model.extend({
    tableName: 'ratings',
    firstImage: function() {
        return this.belongsTo(models.Image, 'firstImageId');
    },
    secondImage: function() {
        return this.belongsTo(models.Image, 'secondImageId');
    },
    betterImage: function() {
        return this.belongsTo(models.Image, 'betterImageId');
    }
})

var types = _.reduce(models, (result, item, key) => {
    result[key] = key;
    return result;
 }, {});

module.exports = {
    bookshelf: bookshelf,
    models: models,
    types: types,
    knex: bookshelf.knex
};
