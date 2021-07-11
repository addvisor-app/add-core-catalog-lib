'use strict';
const AddAxios = require('./add-axios-abstract.js')
const AddAxiosFoundry = require('./add-axios-foundry')

exports.factory = async (options) => {
    
    options = (options) ? options : {}
    let client = (options.enviroment) ? options.enviroment : null;
    
    if(!client){
        const api = require("axios").create();
        const url = process.env.ADD_GLOBAL_VARIABLE_URL +"/ADD_ENVIROMENT";
        const response = await api.get(url, {headers:{accept : "application/json"}})
        console.log("AXIOS Client", response.data)
        if(response && response.data){
            client = response.data.value;
        }
    }

    let api = null;   
    switch (client) {
        case 'sap_foundry':
            api = new AddAxiosFoundry(options);
            break;
        default:
            api = new AddAxios(options);
    }

    return api;
}