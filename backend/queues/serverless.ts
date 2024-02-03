import type { AWS } from '@serverless/typescript';
import { Routes } from 'src/routes';

// Lambda functions
import createTodo from './src/functions/create-todo';
import hello from './src/functions/hello';

// Resources
import customQueueNames from 'resources/custom-queue-names';
import dlq from 'resources/dlq';
import sns from 'resources/sns';
import snsSubscriptions from 'resources/sns-subscriptions';
import sqs from 'resources/sqs';

const serverlessConfiguration: AWS = {
  service: 'queue-service',
  frameworkVersion: '3',
  useDotenv: true,
  custom: {
    stageType: '${opt:stage, env:AWS_STAGE}',
    envType: '${env:ENV_TYPE, "dev"}',

    // SNS Topic
    mailingTopic: 'MailingTopic',
    mailingTopicName: '${self:service}-mailing-topic-${self:provider.stage}',
    mailingTopicArn: { 'Fn::Sub': 'arn:aws:sns:${AWS::Region}:${AWS::AccountId}:${self:custom.mailingTopicName}' },

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
    apiGatewayServiceProxies: [
      {
        sns: {
          path: Routes.SEND_EVENT,
          method: 'post',
          topicName: { 'Fn::GetAtt': ['${self:custom.mailingTopic}', 'TopicName'] },
          cors: true,
        },
      },
    ],
  },
  plugins: ['serverless-esbuild', 'serverless-deployment-bucket', 'serverless-apigateway-service-proxy'],
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
        Resource: '${self:custom.mailingTopicArn}',
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
