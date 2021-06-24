# add-core-catalog-lib

add-core-catalog-lib é uma library do pacote ADD Core com o objetivo de `resitrar` as APIs do seu microservice, `consumir` a API de outros microservice (resolvendo o host da API consumida) e também `observar` as execuções de suas API para notificar aos observadores do BPM , criando assim um trigger de eventos.

## Use

Install

`npm install github:addvisor-app/add-core-catalog-lib --save`

Observação
> Esta LIB depende da `URL` da `Add Core Global Variable` que deve estar conigurada na variavel de ambiente local `process.env.ADD_GLOBAL_VARIABLE_URL`. Com esta URL ela irá buscar a variavel que define o tipo de ambiente para poder calcular corretamente o HOST do destination informado.


## Registry

É importante que para o BPM poder consumir suas API, assim como outros microservices, você registre sua applicação e rotas para o catalogo do Core Flow, para isso basta executar o código abaixo:

```javascript
const express = require('express');
var catalog = require("add-core-catalog-lib");

const app = express();

//Router
app.get('/add/tax/test', ...);
app.get('/add/tax/test/:id', ...);
app.post('/add/tax/test', ...);
app.delete('/add/tax/test', ...);

//instance Server
const port = process.env.PORT || 3000;
const server = app.listen(port, function () {
   catalog.registry(app);
});

```

## Consume

Para consumir outras APIs de outros microservice, não é necessário passar a URL da API destino fixa no código, mas apenas usar a LIB de catalog para indicar o destino do APP consumido e sua URI, a a LIB resolve a URL para o ambiente que esta executando e expoem as operações GET, POST, PUT e DELETE da library `axios` do node-js.

Código de exemplo GET:

```javascript
const catalog = require('add-core-catalog-lib');

const api = await catalog.consume();
const response = await api.destination('add-tax-nfse-app').get('/add/tax/nfse/test');

console.log(response.status, response.data);
```

Exemplo de instanciar com propriedades:

```javascript
const catalog = require('add-core-catalog-lib');

const api = await catalog.consume({'destination': 'add-tax-nfse-app'});
const response = await api.get('/add/tax/nfse/test').catch(err => {console.log(err)})

console.log(response.status, response.data);
```

Exemplo de código POST:

```javascript
const catalog = require('add-core-catalog-lib');

const api = await catalog.consume({'destination': 'add-tax-nfse-app'});
const body = {
    'code': 10,
    'name': 'Gabriel Santos'
}
const response = await api.post('/add/tax/nfse/test', body).catch(err => {console.log(err)})
console.log(response.status, response.data);
```

## Observer

O observer tem como objetivo notificar a execução das suas APIs para o ADD Observer API do pacote Add Core Flow, que fica responsável de acionar, de forma assincrona, todos os serviços observadores reistrados para sua API, criando um  (triggersdo evento de execução da API.

JavaScript Code:

```javascript
const express = require('express');
var catalog = require("add-core-catalog-lib");

const app = express();
app.use(catalog.observer());

// Your Routers and Listner code
//...
```

## License

ADD Cloud - Addvisor