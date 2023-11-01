# api-service

Monolithe api service with express for all your application routes

## Getting started

1. Install serverless framework : [serverless framework Get Started](https://www.serverless.com/framework/docs/getting-started)

1. Setup your aws credentials : [aws config](https://www.serverless.com/framework/docs/providers/aws/guide/credentials)

Create a cloud formation stack on aws : `npm run deploy`

Remove a cloud formation stack on aws : `npm run undeploy`

## Create a new route

1. Add your route in src/routes.ts

1. Create a new folder in src/api from the hello template

1. You can create your routes in src/api/<YOU_RESOURCE>/routes.ts
