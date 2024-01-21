import type { AWS } from '@serverless/typescript';
import { Routes } from 'src/routes';

// Lambda functions
import addToBlacklist from './src/functions/add-to-blacklist';
import addToBounced from './src/functions/add-to-bounced';
import addToMailEvents from './src/functions/add-to-mail-events';
import updatePros from './src/functions/update-pros';
import unsubscribeNewsletter from './src/functions/unsubscribe-newsletter';

// Resources
import customQueueNames from 'resources/custom-queue-names';
import dlq from 'resources/dlq';
import sns from 'resources/sns';
import snsSubscriptions from 'resources/sns-subscriptions';
import sqs from 'resources/sqs';

const serverlessConfiguration: AWS = {
  service: 'mailing-webhook-service',
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
      {
        Effect: 'Allow',
        Action: [
          'ec2:DescribeNetworkInterfaces',
          'ec2:CreateNetworkInterface',
          'ec2:DeleteNetworkInterface',
          'ec2:DescribeInstances',
          'ec2:AttachNetworkInterface',
        ],
        Resource: '*',
      },
      {
        Effect: 'Allow',
        Action: ['ssm:DescribeParameters', 'ssm:GetParameter', 'ssm:GetParameters', 'ssm:GetParametersByPath'],
        Resource: '*',
      },
    ],
    environment: {
      // .env variables
      MONGODB_USERNAME: '${env:MONGODB_USERNAME}',
      MONGODB_USERNAME_PROD: '${env:MONGODB_USERNAME_PROD}',
      MONGODB_PWD: '${env:MONGODB_PWD}',
      ATLAS_DB_URL: '${env:ATLAS_DB_URL}',
      MONGODB_NAME_UMI_PROD: '${env:MONGODB_NAME_UMI_PROD}',
      AWS_STAGE: '${self:provider.stage}',

      // Secure credentials in AWS Systems Manager Parameter Store
      MONGODB_PWD_PROD: '${ssm:MONGODB_PWD_PROD}',
      ATLAS_DB_URL_PROD: '${ssm:ATLAS_DB_URL_PROD}',
      MAILGUN_DOMAIN_KEY: '${ssm:MAILGUN_DOMAIN_KEY}',

      // DLQ variables
      ADD_TO_BLACKLIST_QUEUE_DLQ_NAME: '${self:custom.addToBlacklistQueueDLQName}',
      ADD_TO_BOUNCED_QUEUE_DLQ_NAME: '${self:custom.addToBouncedQueueDLQName}',
      ADD_TO_MAIL_EVENTS_QUEUE_DLQ_NAME: '${self:custom.addToMailEventsQueueDLQName}',
      UPDATE_PROS_EVENTS_QUEUE_DLQ_NAME: '${self:custom.updateProsQueueDLQName}',
      UNSUBSCRIBE_NEWSLETTER_EVENTS_QUEUE_DLQ_NAME: '${self:custom.unsubscribeNewsletterQueueDLQName}',
    },
  },
  functions: {
    addToBlacklist,
    addToBounced,
    addToMailEvents,
    updatePros,
    unsubscribeNewsletter,
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
