'use strict';

const _debug = false;

exports.factory = (app) => {
    this._debug = (process.env.ADD_CATALOG_DEBUG) ? process.env.ADD_CATALOG_DEBUG : true;
    //return middleware;
    var pjson = require('../../../../package.json');
    this._app = pjson.name;
    if(app){
        app._router.stack.forEach(function(r){
            if (r.route && r.route.path){
                _log(pjson.name, r.route.path)
            }
        })
    }
}

//var middleware = async (req, res, next) => {
//    _log(req.url)
//    next();
//}

var _log = async (...args) => {
    //if(_debug){
        let [date] = new Date().toLocaleString('pt-BR').split(', ');
        console.log("[",date, "ADD CATALOG REGITRY LIB]", ...args);
    //}
}
