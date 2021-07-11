'use strict';

const axios = require("axios");
var UrlPattern = require('url-pattern');

const _pckJson = require('../../../../package.json');
const _header = { headers:{accept : "application/json"}};
let _config = null;

exports.factory = (options) => {
    _config = _setConfig(options);
    _loadObservers();
    return middleware;
}

var middleware = async (req, res, next) => {
   
    //Binding Host Catalog - workarround to registry
    _binding(req);
    
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
        const obs = _hasObserver(req, res);
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
        debug : (process.env.ADD_CATALOG_DEBUG) ? process.env.ADD_CATALOG_DEBUG : false,
        urlVariable: url + '/add/flow/runtime/variables',
        urlBinding: url + '/add/flow/catalog/binding',
        urlPublish: url + '/add/flow/observer/publish',
        urlPush: url + '/add/flow/observer/push',
        listeners: [],
        binding : null
    }
}

var _loadObservers = async () => {
    const url = _config.urlPublish + "?app=" + _pckJson.name
    var response = await axios.get(url).catch(err =>{_error("_loadObservers err:", err.message)});;
    
    const obserevers = (response && response.data) ? response.data : [];
    _config.listeners = obserevers;
    _log("_loadObservers", obserevers);
} 

var _key = (req) =>{
    return req.method+'_'+req.url
}

var _hasObserver = (req, res) =>{
    let obs = null;
    
    _config.listeners.forEach(el => {
        _log("_hasObserver REQ", req.method, req.path, res.statusCode);
        _log("_hasObserver OBS", el.method, el.uri, el.statuscode);
        
        let urlObs = el.uri;
        
        var pattern = new UrlPattern(urlObs);
        const match = pattern.match(req.path)
        if(match){
            for (var prop in match) {
                urlObs = urlObs.replace(":"+prop, match[prop])
            }
        }
        //TODO - Veriicar status code tb, mas não é obrigatorio no observer publish
        if (urlObs == req.path && el.method == req.method){
            obs = el;
        }
    });

    return obs;
}

var _nofity = async (req, res, body, obs) => {
    let url = _config.urlPush;
    const metaId = await _searchMetadataId(req, res, body, obs);
    url = url.replace(":metadataId", metaId);
    
    body = (body) ? JSON.parse(body) : null;

    const observed = {
        id: obs.id,
        metadataId: metaId,
        url: req.url,
        method: req.method,
        statusCode: res.statusCode,
        body: body
    }

    _log('INVOKE from', req.url, body.id);
    _log('INVOKE to', url, obs.id);
    axios.post(url, observed).catch(err =>{_error('OBSERVER NOTIFY FAILER', err.config.url, "ERROR:", err.message);});
}

var _searchMetadataId = async (req, res, body, obs) =>{

    let metaId = null;

    _log("_searchMetadataId obs.uri",obs)
    //Serch by URL
    var pattern = new UrlPattern(obs.uri);
    const match = pattern.match(req.path)
    if(match){
        for (var prop in match) {
            if(prop === "metadataId" || prop === "metadataID" || prop === "metaId"){
                metaId = match[prop]
            }
        }
    }

    if (metaId === null || metaId === undefined){
        const b = JSON.parse(body)
    
        if(b && b.metaInfo && b.metaInfo.metadataId){
            metaId = b.metaInfo.metadataId;
        }else if(b && b.metadata && b.metadata.id){
            metaId = b.metadata.id;
        }else if(b && b.metadataId){
            metaId = b.metadataId;
        }
    }
    _log('METADATA ID', metaId);
    return metaId;
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
    if(_config.debug == true){
        let [date] = new Date().toLocaleString('pt-BR').split(', ');
        console.log("[",date, "ADD CATALOG LIB - OBSERVER",_pckJson.name,"]", ...args);
    }
}

var _error = async (...args) => {
    let [date] = new Date().toLocaleString('pt-BR').split(', ');
    console.error("[",date, "ADD CATALOG LIB - OBSERVER ERROR",_pckJson.name,"]", ...args)
}