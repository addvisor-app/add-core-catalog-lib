'use strict';
const axios = require("axios");
module.exports = class AddAxios {

    constructor(options){
        options = (options) ? options : {}
        this._destination = (options.destination) ? options.destination : null;
        this._debug = (options.debug) ? options.debug : (process.env.ADD_CATALOG_DEBUG) ? process.env.ADD_CATALOG_DEBUG : false
        this._config = { headers:{accept : "application/json"}}
        this._api = axios.create();
    }

    async get(uri){
        //config.headers.authorization = req.session.jwt.access_token;
        const url = await this._getUrl(uri);
        return await this._api.get(url, this._config)
        /*
        return new Promise((resolve, reject) => {
            try {
                const response = await this._api.get(url, this._config)
                // Request Succeeded!
                resolve(response);
            } catch (error) {
                //error.response
                //error.response.data.error
                reject(error);
            }
        });
        */
    }   

    async post(uri, body){
        //config.headers.authorization = req.session.jwt.access_token;
        const url = await this._getUrl(uri);
        return await this._api.post(url, JSON.stringify(body), this._config)
    }

    async put(uri, body){
        //config.headers.authorization = req.session.jwt.access_token;
        const url = await this._getUrl(uri);
        return await this._api.put(url, JSON.stringify(body), this._config)
    }
    
    async delete(uri){
        //config.headers.authorization = req.session.jwt.access_token;
        const url = await this._getUrl(uri);
        return await this._api.delete(url, null, this._config)
    }

    destination(app){
        this._log("set destination ", this._destination);
        this._api.baseURL = null;
        this._destination = app;
        return this;
    }

    host(host){
        this._log("set host ", host);
        this._api.baseURL = host;
        return this;
    }

    config(config){
        this._log("set config ", config);
        this._config = config;
        return this;
    }
    
    async _getUrl(uri){
        const url = await this._getHost() + uri;
        this._log("_getUrl ", url);
        return url;
    }

    async _getHost(){
        this._log("_getHost baseURL", this._api.baseURL)
        return (this._api.baseURL) ? this._api.baseURL : "";
    }

    async _log (...args) {
        if(this._debug == true){
            let [date] = new Date().toLocaleString('pt-BR').split(', ');
            console.log("[",date, "ADD AXIOS LIB]", ...args);
        }
    }
}