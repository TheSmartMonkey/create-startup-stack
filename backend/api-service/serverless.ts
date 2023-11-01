import type { AWS } from '@serverless/typescript';
import { BASE_URL } from 'src/helpers/constants';

const serverlessConfiguration: AWS = {
  service: 'serverless-express-ts-service',
  frameworkVersion: '3',
  useDotenv: true,
  custom: {
    stageType: '${opt:stage, env:AWS_STAGE, "dev"}',

    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node16',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
      loader: { '.html': 'text' },
    },
  },
  plugins: ['serverless-esbuild', 'serverless-deployment-bucket'],
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    stage: '${self:custom.stageType}',
    region: 'eu-west-3',
    deploymentBucket: {
      name: '${self:service}-${self:provider.region}-deployment-bucket',
    },
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_STAGE: '${self:custom.stageType}',

      // .env variables
      ATLAS_DB_URL: '${env:ATLAS_DB_URL}',
      MONGODB_USERNAME: '${env:MONGODB_USERNAME}',
      MONGODB_PASSWORD: '${env:MONGODB_PASSWORD}',
      MONGODB_NAME: '${env:MONGODB_NAME}',

      // Secure credentials in AWS Systems Manager Parameter Store
      JWT_TOKEN_SECRET: '${ssm:JWT_TOKEN_SECRET}',
    },
  },
  functions: {
    api: {
      handler: 'src/server.handler',
      events: [
        {
          http: {
            method: 'ANY',
            path: BASE_URL,
          },
        },
        {
          http: {
            method: 'ANY',
            path: `${BASE_URL}/{proxy+}`,
          },
        },
      ],
    },
  },
  package: {
    individually: true,
  },
  resources: {},
};

module.exports = serverlessConfiguration;
