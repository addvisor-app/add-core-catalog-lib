'use strict';

let _debug = false;

exports.clientPublish = (app) => {

    _debug = (process.env.ADD_CATALOG_DEBUG) ? process.env.ADD_CATALOG_DEBUG : true;
    
    const url = process.env.ADD_GLOBAL_VARIABLE_URL;
    if(!url){
        _error("Não foi identificado a environment variable ADD_GLOBAL_VARIABLE_URL");
        return;
    }
    
    const pjson = require('../../../../package.json');
    const appName = pjson.name;

    if(app){
        app._router.stack.forEach(function(r){
            if (r.route && r.route.path){
                const methods = r.route.methods;
                const method = (methods.delete) ? "DELETE" : (methods.put) ? "PUT" : (methods.post) ? "POST" : (methods.get) ? "GET" : "UNDEFINED";  
                _log(appName, method, r.route.path)
            }
        })
    }
}

var _log = async (...args) => {
    if(_debug){
        let [date] = new Date().toLocaleString('pt-BR').split(', ');
        console.log("[",date, "ADD CATALOG REGITRY LIB]", ...args);
    }
}

var _error = async (...args) => {
    let [date] = new Date().toLocaleString('pt-BR').split(', ');
    console.error("[",date, "ADD CATALOG REGITRY LIB ERROR]", ...args)
}