'use strict';
const registry = require("./registry/registry-factory.js");

exports.registry = (options) => {
    options = (options) ? options : {}
    return registry.factory(options);
}

exports.observer = (options) => {
    options = (options) ? options : {}
    return registry.factory(options);
}

exports.consume = (options) => {
    options = (options) ? options : {}
    return registry.factory(options);
}