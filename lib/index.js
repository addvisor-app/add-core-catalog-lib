'use strict';
const registry = require("./registry/registry-factory.js");

exports.registry = (app) => {
    return registry.factory(app);
}

exports.observer = (options) => {
    options = (options) ? options : {}
    return registry.factory(options);
}

exports.consume = (options) => {
    options = (options) ? options : {}
    return registry.factory(options);
}