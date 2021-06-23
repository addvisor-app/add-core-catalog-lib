'use strict';

const axios = require("axios");
const pckJson = require('../../../../package.json');
let _config = null;

exports.factory = (options) => {
    _config = _setConfig(options);
    return middleware;
}

var middleware = async (req, res, next) => {
    _log(req.headers.host, req.url);
    //Execute API
    next();
}

var _setConfig = (options) =>{
    return {
        debug : (process.env.ADD_CATALOG_DEBUG) ? process.env.ADD_CATALOG_DEBUG : true,
        host: process.env.OBSERVER_HOST || 'http://localhost:8200',
        uriPublish: process.env.OBSERVER_PUBLISH_URI || '/add/observer/publish',
        uriPush: process.env.OBSERVER_PUSH_URI || '/add/observer/push',
        debug: process.env.OBSERVER_DEBUG || true,
        listeners: []
    }
}

var _log = async (...args) => {
    if(_config.debug){
        let [date] = new Date().toLocaleString('pt-BR').split(', ');
        console.log("[",date, "ADD CATALOG LIB - OBSERVER]", ...args);
    }
}

var _error = async (...args) => {
    let [date] = new Date().toLocaleString('pt-BR').split(', ');
    console.error("[",date, "ADD CATALOG LIB - OBSERVER ERROR]", ...args)
}