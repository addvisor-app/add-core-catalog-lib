'use strict';

const axios = require("axios");
const _pckJson = require('../../../../package.json');
let _config = null;
const _header = { headers:{accept : "application/json"}};

exports.factory = (options) => {
    _config = _setConfig(options);
    return middleware;
}

var middleware = async (req, res, next) => {
   
    //Binding Host Catalog
    binding(req);
   

    //Execute API
    next();
}


var _setConfig = (options) =>{
    
    const url = (process.env.ADD_GLOBAL_VARIABLE_URL) ? process.env.ADD_GLOBAL_VARIABLE_URL.replace('/add/flow/runtime/variables','') : null;
    if(!url){
        _error("Não foi identificado a environment variable ADD_GLOBAL_VARIABLE_URL");
    }

    return {
        debug : (process.env.ADD_CATALOG_DEBUG) ? process.env.ADD_CATALOG_DEBUG : true,
        urlVariable: url + '/add/flow/runtime/variables',
        urlBinding: url + '/add/flow/catalog/binding',
        urlPublish: url + '/add/flow/observer/publish',
        urlPush: url + '/add/flow/observer/push',
        listeners: [],
        binding : null
    }
}

var binding = async (req) => {
    const host = req.headers.host;
    
    if( _config.binding !== host ){
        
        let protocol = req.connection.encrypted ? 'https' : 'http';
        protocol = req.headers['x-forwarded-proto'] || protocol;
        _log(protocol, host);

        const binding = {
            'protocol': protocol,
            'host': host
        }
        const urlBinding = _config.urlBinding + '/'+ _pckJson.name;

        axios.post(urlBinding, binding, _header).catch(err => { 
            _error("Erro para binding catalog: ", _pckJson.name, " - error:",err.message)
        });
        _config.binding = host;
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