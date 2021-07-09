
const AddAxios = require('./add-axios-abstract.js')
const axios = require("axios");

module.exports = class AddAxiosFoundry extends AddAxios{

    constructor(options){
        super(options);
        this._subaccount = null; //"addvisor-dev";
        this._domain = null; //"cfapps.us10.hana.ondemand.com";
    }

    async _getHost(){
        //Workaround - Deve Consumir a API CF para pegar as rotas dos APP e ideintifficar a URL
        //Enquanto não desenrola o consumo dess API, vamos calcular a URL como <app>-<subaccount>.<domain> 
        //que é o padrão nos manifests projetos ADD para SAP Cloud Foundry
        if(!this._domain){
            const resp = await this._getGlobalVariable('/ADD_DOMAIN');
            if(resp && resp.data){
                this._log('AddAxiosFoundry _getHost /ADD_DOMAIN', resp.data.value);
                this._domain = resp.data.value;
            }
        }

        if(!this._subaccount){
            const resp = await this._getGlobalVariable('/ADD_SUBACCOUNT');
            if(resp && resp.data){
                this._log('AddAxiosFoundry _getHost /ADD_SUBACCOUNT', resp.data.value);
                this._subaccount = resp.data.value;
            }
        }

        if(!this._api.baseURL){
            const urlRegistry = "https://add-core-flow-api-"+this._subaccount+"."+this._domain+"/add/flow/catalog/binding/"+ this._destination
            console.log("######## CATALOG SCF urlRegistry", urlRegistry);
            const binding = await this._api.get(urlRegistry);
            if(binding && binding.data){
                console.log("######## CATALOG SCF binding", binding.data);
                this._api.baseURL = binding.data.protocol+"://"+binding.data.host;
            }else{
                //Workarround
                this._api.baseURL = "https://"+ this._destination+"-"+this._subaccount+"."+this._domain;
            }
        }
        console.log("######## CATALOG SCF baseURL", this._api.baseURL);
        this._log("AddAxiosFoundry _getHost baseURL", this._api.baseURL)
        return this._api.baseURL;
    }

    async _getGlobalVariable(variable){
        let url = process.env.ADD_GLOBAL_VARIABLE_URL +"/"+variable;
        return await this._api.get(url, this._config)
    }
}