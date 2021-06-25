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
   
    //Binding Host Catalog - workarround to registry
    _binding(req);
    
    //Init Observer
    if(!_config.listeners[_key(req)]){
        await _loading(req);
    }

    //Intercept Body from Express
    const defaultWrite = res.write;
    const defaultEnd = res.end;
    const chunks = [];

    res.write = (...restArgs) => {
        chunks.push(new Buffer.from(restArgs[0]));
        defaultWrite.apply(res, restArgs);
    };

    res.end = (...restArgs) => {
        if (restArgs[0]) {
            chunks.push(new Buffer.from(restArgs[0]));
        }
        const body = Buffer.concat(chunks).toString('utf8');
        defaultEnd.apply(res, restArgs);
        
        //Check and Notify Obserevers
        const obs = _config.listeners[_key(req)];
        if(obs){
            _nofity(req, res, body, obs);
        }
    };

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

var _key = (req) =>{
    return req.method+'_'+req.url
}

var _loading = async (req) => {
    const url = _config.urlPublish + "?uri=" + req.url;
    _log('loading', url);
    var response = await axios.get(url).catch(err =>{_error(err.config.url, "ERROR:", err.message)});;

    if(response){
        _log('response.data', );
        const obs = response.data;
        if(obs){
            //if(item.uri === req.url && item.method === req.method){
            if(obs.uri === req.url){
                _log('has observers to', req.url);
                _config.listeners[_key(req)] = obs;
            }
        }
    }
}

var _nofity = async (req, res, body, obs) => {

    const url = _config.urlPush;
    const observed = {
        id: obs.id,
        url: req.url,
        method: req.method,
        statusCode: res.statusCode,
        body: JSON.parse(body)
    }

    _log('INVOKE fom', req.url, body.id);
    _log('INVOKE to', url, obs.id);
    const url2 = "htp://localhost:8200/add/flow/observer/push"
    axios.post(url2, observed).catch(err =>{_error('OBSERVER NOTIFY FAILER', err.config.url, "ERROR:", err.message);});
}

var _binding = async (req) => {
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
        _log('urlBinding', urlBinding);
        axios.post(urlBinding, binding, _header).catch(err => { 
            _error("Erro para binding catalog: ", _pckJson.name, " - error:",err.message)
        });
        _config.binding = host;
    }
}

var _log = async (...args) => {
    if(_config.debug){
        let [date] = new Date().toLocaleString('pt-BR').split(', ');
        console.log("[",date, "ADD CATALOG LIB - OBSERVER",_pckJson.name,"]", ...args);
    }
}

var _error = async (...args) => {
    let [date] = new Date().toLocaleString('pt-BR').split(', ');
    console.error("[",date, "ADD CATALOG LIB - OBSERVER ERROR",_pckJson.name,"]", ...args)
}