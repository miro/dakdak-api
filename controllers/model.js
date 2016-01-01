// # modelController
//      everything related to models - persons, images, spots
//
'use strict';

let Promise             = require('bluebird');

let db                  = require('../database');
let log                 = require('../log');


let controller = {};


controller.getAll = function(modelType) {
    return new Promise((resolve, reject) => {
        new db
        .models[modelType]()
        .fetchAll()
        .then(items => resolve(items))
        .error(error => reject(error));
    });
};

controller.getSingle = function(modelType, whereObject) {
    // TODO: fetch only one row?
    return new Promise((resolve, reject) => {
        new db.models[modelType]()
        .where(whereObject)
        .fetch()
        .then(result => resolve(result))
        .error(error => reject(error));
    });
};


controller.create = function(modelType, props) {
    return new Promise((resolve, reject) => {
        let model = new db.models[modelType](props);
        model.save()
        .then(savedProps => resolve(savedProps))
        .error(error => reject(error));
    });
};


controller.update = function(modelType, id, newAttrs) {
    return new Promise((resolve, reject) => {

        new db.models[modelType]({ id })
        .fetch({ require: true })
        .then(model => {
            model.save(newAttrs, { patch: true })
            .then(function saveOk(newModel) {
                resolve(newModel);
            })
            .error(function saveNotOk(error) {
                reject(error);
            });
        })
        .catch(error => reject(error));
    });
};


controller.delete = function(modelType, id) {
    return new Promise((resolve, reject) => {

        new db.models[modelType]({ id })
        .fetch({ require: true })
        .then(model => {
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
        .catch(error => {
            log.debug('Catch on modelController delete Pokemon block', error);
            reject(error);
        });
    });
};


module.exports = controller;
