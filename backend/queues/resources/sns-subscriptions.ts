import { QUEUE_SERVICE_QUEUE_EVENTS } from '@models/queues/queue-service-events';

/**
 * Don't forgot to add your Subscription in sns.ts > DependsOn and your queue in sns.ts > Queues
 */
export default {
  // SQS
  HelloSubscription: {
    DependsOn: ['${self:custom.helloQueue}'],
    Type: 'AWS::SNS::Subscription',
    Properties: {
      Protocol: 'sqs',
      Endpoint: {
        'Fn::GetAtt': ['${self:custom.helloQueue}', 'Arn'],
      },
      TopicArn: {
        Ref: '${self:custom.queueServiceTopic}',
      },
      FilterPolicyScope: 'MessageBody',
      FilterPolicy: {
        eventType: QUEUE_SERVICE_QUEUE_EVENTS.HelloQueue,
      },
      RedrivePolicy: {
        deadLetterTargetArn: {
          'Fn::GetAtt': ['${self:custom.queueServiceTopicRedirectionQueueDLQ}', 'Arn'],
        },
      },
    },
  },

  CreateTodoSubscription: {
    DependsOn: ['${self:custom.createTodoQueue}'],
    Type: 'AWS::SNS::Subscription',
    Properties: {
      Protocol: 'sqs',
      Endpoint: {
        'Fn::GetAtt': ['${self:custom.createTodoQueue}', 'Arn'],
      },
      TopicArn: {
        Ref: '${self:custom.queueServiceTopic}',
      },
      FilterPolicyScope: 'MessageBody',
      FilterPolicy: {
        eventType: QUEUE_SERVICE_QUEUE_EVENTS.CreateTodoQueue,
      },
      RedrivePolicy: {
        deadLetterTargetArn: {
          'Fn::GetAtt': ['${self:custom.queueServiceTopicRedirectionQueueDLQ}', 'Arn'],
        },
      },
    },
  },
};
