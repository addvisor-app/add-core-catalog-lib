'use strict';
const axios = require("axios");
const pckJson = require('../../../../package.json');


let _debug = false;


exports.clientPublish = (app) => {

    _debug = (process.env.ADD_CATALOG_DEBUG) ? process.env.ADD_CATALOG_DEBUG : true;
    
    const url = _getUrl();
    if(!url){
        _error("Não foi identificado a environment variable ADD_GLOBAL_VARIABLE_URL");
        return;
    }
    _log("url registry:",url);
       

    const routers = _getRouters(app);
    _log("routers:",routers);

    if(routers){
        const api = axios.create();
    }
}

var _getUrl = () =>{
    let url = process.env.ADD_GLOBAL_VARIABLE_URL;
    if(url.includes('/add/flow/runtime/variables')){
        url = url.replace('/add/flow/runtime/variables', '/add/flow/catalog/registry');   
    }
    return url;
}

var _getRouters = (app) =>{
    let routers = [];
    if(app){
        app._router.stack.forEach(function(r){
            if (r.route && r.route.path){
                const methods = r.route.methods;
                const method = (methods.delete) ? "DELETE" : (methods.put) ? "PUT" : (methods.post) ? "POST" : (methods.get) ? "GET" : "UNDEFINED";  
                _log(pckJson.name, method, r.route.path)
                routers.push({
                    'app': pckJson.name,
                    'method': method,
                    'uri': r.route.path
                })     
            }
        })
    }
    return routers;
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