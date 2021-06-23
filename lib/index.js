'use strict';
const registry = require("./registry/registry-factory.js");

exports.registry = (app) => {
    return registry.clientPublish(app);
}

exports.observer = (options) => {
    options = (options) ? options : {}
    //return registry.clientPublish(options);
}

exports.consume = (options) => {
    options = (options) ? options : {}
    //return registry.factory(options);
}