import type { AWS } from '@serverless/typescript';

// Lambda functions
import createTodo from './src/create-todo';
import hello from './src/hello';

// Resources
import customQueueNames from 'resources/custom-queue-names';
import dlq from 'resources/dlq';
import sns from 'resources/sns';
import snsSubscriptions from 'resources/sns-subscriptions';
import sqs from 'resources/sqs';

const serverlessConfiguration: AWS = {
  service: 'myProjectName-queue-service',
  frameworkVersion: '3',
  useDotenv: true,
  custom: {
    stageType: '${opt:stage, env:AWS_STAGE}',
    envType: '${env:ENV_TYPE, "dev"}',

    // SNS Topic
    queueServiceTopic: 'QueueServiceTopic',
    queueServiceTopicName: '${self:service}-topic-${self:provider.stage}',
    queueServiceTopicArn: { 'Fn::Sub': 'arn:aws:sns:${AWS::Region}:${AWS::AccountId}:${self:custom.queueServiceTopicName}' },

    // SQS Queues
    ...customQueueNames,

    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
      loader: { '.html': 'text' },
    },
  },
  plugins: ['serverless-esbuild', 'serverless-deployment-bucket'],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    stage: '${self:custom.stageType}',
    profile: '${opt:profile, env:AWS_PROFILE}',
    region: 'eu-west-3',
    deploymentBucket: {
      name: '${self:service}-${self:custom.envType}-${self:provider.region}-deployment-bucket',
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
      {
        Effect: 'Allow',
        Action: ['SQS:SendMessage', 'SQS:SendMessageBatch', 'SQS:ReceiveMessage', 'SQS:DeleteMessage', 'SQS:GetQueueAttributes'],
        Resource: '*',
      },
    ],
    environment: {
      // .env variables
      ATLAS_DB_URL: '${env:ATLAS_DB_URL}',
      MONGODB_USERNAME: '${env:MONGODB_USERNAME}',
      MONGODB_PASSWORD: '${env:MONGODB_PASSWORD}',
      MONGODB_NAME: '${env:MONGODB_NAME}',
      AWS_STAGE: '${self:provider.stage}',

      // DLQ variables
      HELLO_QUEUE_DLQ_NAME: '${self:custom.helloQueueDLQName}',
      CREATE_TODO_QUEUE_DLQ_NAME: '${self:custom.createTodoQueueDLQName}',
    },
  },
  functions: {
    hello,
    createTodo,
  },
  package: {
    // When true optimise lambda performance but increase deployment time
    individually: !!process.env.STAGE_TYPE && process.env.STAGE_TYPE !== 'dev',
  },
  resources: {
    Resources: Object.assign(dlq, sqs, sns, snsSubscriptions),
  },
};

module.exports = serverlessConfiguration;
