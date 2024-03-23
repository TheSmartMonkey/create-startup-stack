import { API_SERVICE_BASE_URL } from '@helpers/constants';
import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'my-project-name-api-service',
  frameworkVersion: '3',
  useDotenv: true,
  custom: {
    stageType: '${opt:stage, env:AWS_STAGE, "dev"}',

    // QUEUE_SERVICE_SNS_TOPIC
    queueServiceName: 'my-project-name-queue-service',
    queueServiceTopic: 'QueueServiceTopic',
    queueServiceTopicName: '${self:custom.queueServiceName}-topic-${self:provider.stage}',
    queueServiceTopicArn: { 'Fn::Sub': 'arn:aws:sns:${AWS::Region}:${AWS::AccountId}:${self:custom.queueServiceTopicName}' },

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
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['SNS:Publish', 'SNS:Subscribe'],
        Resource: '${self:custom.queueServiceTopicArn}',
      },
    ],
    environment: {
      AWS_STAGE: '${self:custom.stageType}',

      // .env variables
      ATLAS_DB_URL: '${env:ATLAS_DB_URL}',
      MONGODB_USERNAME: '${env:MONGODB_USERNAME}',
      MONGODB_PASSWORD: '${env:MONGODB_PASSWORD}',
      MONGODB_NAME: '${env:MONGODB_NAME}',

      // SNS topics
      QUEUE_SERVICE_SNS_TOPIC_ARN: '${self:custom.queueServiceTopicArn}',

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
            path: API_SERVICE_BASE_URL,
          },
        },
        {
          http: {
            method: 'ANY',
            path: `${API_SERVICE_BASE_URL}/{proxy+}`,
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
