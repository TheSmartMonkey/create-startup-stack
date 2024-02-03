import { QUEUE_EVENTS } from './queues';

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
        Ref: '${self:custom.mailingTopic}',
      },
      FilterPolicyScope: 'MessageBody',
      FilterPolicy: {
        queueInfos: {
          name: QUEUE_EVENTS.HelloQueue,
        },
      },
      RedrivePolicy: {
        deadLetterTargetArn: {
          'Fn::GetAtt': ['${self:custom.mailingTopicRedirectionQueueDLQ}', 'Arn'],
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
        Ref: '${self:custom.mailingTopic}',
      },
      FilterPolicyScope: 'MessageBody',
      FilterPolicy: {
        queueInfos: {
          name: QUEUE_EVENTS.CreateTotoQueue,
        },
      },
      RedrivePolicy: {
        deadLetterTargetArn: {
          'Fn::GetAtt': ['${self:custom.mailingTopicRedirectionQueueDLQ}', 'Arn'],
        },
      },
    },
  },
  MailingTopicRedirectionKeepAllMessagesSubscription: {
    DependsOn: ['${self:custom.mailingTopicRedirectionKeepAllMessagesQueue}'],
    Type: 'AWS::SNS::Subscription',
    Properties: {
      Protocol: 'sqs',
      Endpoint: {
        'Fn::GetAtt': ['${self:custom.mailingTopicRedirectionKeepAllMessagesQueue}', 'Arn'],
      },
      TopicArn: {
        Ref: '${self:custom.mailingTopic}',
      },
      FilterPolicyScope: 'MessageBody',
      FilterPolicy: {
        'event-data': {
          event: [{ exists: false }],
        },
      },
      RedrivePolicy: {
        deadLetterTargetArn: {
          'Fn::GetAtt': ['${self:custom.mailingTopicRedirectionQueueDLQ}', 'Arn'],
        },
      },
    },
  },
  MailingTopicRedirectionKeepOtherEventsSubscription: {
    DependsOn: ['${self:custom.mailingTopicRedirectionKeepOtherEventsQueue}'],
    Type: 'AWS::SNS::Subscription',
    Properties: {
      Protocol: 'sqs',
      Endpoint: {
        'Fn::GetAtt': ['${self:custom.mailingTopicRedirectionKeepOtherEventsQueue}', 'Arn'],
      },
      TopicArn: {
        Ref: '${self:custom.mailingTopic}',
      },
      FilterPolicyScope: 'MessageBody',
      FilterPolicy: {
        'event-data': {
          event: [{ 'anything-but': QUEUE_EVENTS.all }],
        },
      },
      RedrivePolicy: {
        deadLetterTargetArn: {
          'Fn::GetAtt': ['${self:custom.mailingTopicRedirectionQueueDLQ}', 'Arn'],
        },
      },
    },
  },
};
