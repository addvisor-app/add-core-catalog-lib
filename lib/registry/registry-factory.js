'use strict';

const _debug = false;

exports.factory = (options) => {
    this._debug = (options.debug) ? options.debug : (process.env.ADD_CATALOG_DEBUG) ? process.env.ADD_CATALOG_DEBUG : true;
    return middleware;
}

var middleware = async (req, res, next) => {
    _log(req.url)
    next();
}

var _log = async (...args) => {
    //if(_debug){
        let [date] = new Date().toLocaleString('pt-BR').split(', ');
        console.log("[",date, "ADD CATALOG REGITRY LIB]", ...args);
    //}
}
