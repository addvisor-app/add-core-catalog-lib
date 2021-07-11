
const AddAxios = require('./add-axios-abstract.js')
const axios = require("axios");

module.exports = class AddAxiosFoundry extends AddAxios{

    constructor(options){
        super(options);
        this._subaccount = null; //"addvisor-dev";
        this._domain = null; //"cfapps.us10.hana.ondemand.com";
    }

    async _getHost(){
        
        if(!this._api.baseURL){
            let urlRegistry  = process.env.ADD_GLOBAL_VARIABLE_URL;
            urlRegistry  = urlRegistry.replace('/add/flow/runtime/variables', '/add/flow/catalog/binding');
            urlRegistry = urlRegistry + "/"+ this._destination
            
            this._log('AddAxiosFoundry urlRegistry', urlRegistry);
            const binding = await this._api.get(urlRegistry);
            if(binding && binding.data){
                this._api.baseURL = binding.data.protocol+"://"+binding.data.host;
            }
        }
        this._log("AddAxiosFoundry _getHost baseURL", this._api.baseURL)
        return this._api.baseURL;
    }

    async _getGlobalVariable(variable){
        let url = process.env.ADD_GLOBAL_VARIABLE_URL +"/"+variable;
        this._log('AddAxiosFoundry _getGlobalVariable', url);
        return await this._api.get(url, this._config)
    }
}