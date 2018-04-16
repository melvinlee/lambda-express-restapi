# AWS Lambda REST API using Serverless, Express and Nodejs

Demostrate how to use the popular Node web framework Express.js to deploy a Serverless REST API. This means you can use your existing code + the vast Express.js ecosystem and benefits of Serverless. 

## Getting Started

Install the `serverless-http` framework

```sh 
$ npm install --save express serverless-http
```

The `serverless-http` package is a middleware that handles the interface between Node.js express application and the specifics of API Gateway.

Let's create an index.js file that has our application code:

```js
// index.js

const serverless = require('serverless-http');
const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.send('Hello World!')
})

module.exports.handler = serverless(app);
```

To get this application deployed, let's create a `serverless.yml`

```yml
# serverless.yml

functions:
  app:
    handler: index.handler
    events:
      - http: ANY /
      - http: 'ANY {proxy+}'
```

We've created one function, app, which uses the exported handler from our index.js file. Finally, it's configured with some HTTP triggers.

We've used a very broad path matching so that all requests on this domain are routed to this function. All of the HTTP routing logic will be done inside the Express application.