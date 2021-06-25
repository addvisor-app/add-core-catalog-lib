'use strict';

const axios = require("axios");
const pckJson = require('../../../../package.json');
let _debug = false;
const _header = { headers:{accept : "application/json"}};


exports.clientPublish = async (app) => {

    _debug = (process.env.ADD_CATALOG_DEBUG) ? process.env.ADD_CATALOG_DEBUG : false;
    
    const url = await _getUrl();
    _log("url registry:",url);
    if(!url){
        _error("Não foi identificado a environment variable ADD_GLOBAL_VARIABLE_URL");
        return;
    }
    
       
    const catalog = await _getCatalog(app);
    _log("catalog:", catalog);    
    if(catalog){
        axios.post(url, catalog, _header).catch(err => { 
            _error("Erro para publicar catalog: ", err.message)
        });
    }
}

var _getUrl = async  () =>{
    let url = process.env.ADD_GLOBAL_VARIABLE_URL;
    if(url.includes('/add/flow/runtime/variables')){
        url = url.replace('/add/flow/runtime/variables', '/add/flow/catalog/registry');   
    }
    return url;
}

var _getCatalog = async (app) =>{
    
    let catalog = {
        'app': pckJson.name,
        'version' : pckJson.version,
        'type': 'node-js',
        'api': [],
        'binding': [],
        'managed':{'createdBy':'add-core-catalog-lib'}
    };

    if(app){
        app._router.stack.forEach(function(r){
            if (r.route && r.route.path){
                const methods = r.route.methods;
                const method = (methods.delete) ? "DELETE" : (methods.put) ? "PUT" : (methods.post) ? "POST" : (methods.get) ? "GET" : "UNDEFINED";  
                
                catalog.api.push({
                    'method': method,
                    'uri': r.route.path
                })     
            }
        })
    }

    const host = (process.env.ADD_GLOBAL_VARIABLE_URL !="http://localhost:8200/add/flow/runtime/variables") ? process.env.ADD_GLOBAL_VARIABLE_URL : "https://add-core-flow-api-addvisor-dev.cfapps.us10.hana.ondemand.com/add/flow/runtime/variables";
    const resp = await axios.get(host+'/ADD_DOMAIN', _header).catch(err=>{_error("Erro DOMAIN:", err.message);});
    const domain = (resp && resp.data) ? resp.data.value : null;

    const resp2 = await axios.get(host+'/ADD_SUBACCOUNT', _header).catch(err=>{ _error("Erro SUBACCOUNT:",err.message)});
    const subaccount = (resp2 && resp2.data) ? resp2.data.value : null;

    if(domain && subaccount){
        catalog.binding.push({
            'protocol': 'https',
            'host': pckJson.name+"-"+subaccount+"."+domain
        });
    }
        
    return catalog;
}

var _log = async (...args) => {
    console.log('_debug log', _debug)
    
    if( _debug == true){
        let [date] = new Date().toLocaleString('pt-BR').split(', ');
        console.log("[",date, "ADD CATALOG LIB - REGITRY",pckJson.name,"]", ...args);
    }
}

var _error = async (...args) => {
    let [date] = new Date().toLocaleString('pt-BR').split(', ');
    console.error("[",date, "ADD CATALOG LIB - REGITRY ERROR",pckJson.name,"]", ...args)
}