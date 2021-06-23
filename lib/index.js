'use strict';
const registry = require("./registry/catalog-publish.js");
const observer = require("./observer/observer-push.js");

exports.registry = (app) => {
    return registry.clientPublish(app);
}

exports.observer = (options) => {
    options = (options) ? options : {}
    return observer.factory(options);
}

exports.consume = (options) => {
    options = (options) ? options : {}
    //return registry.factory(options);
}