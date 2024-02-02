import { mailgunEventsByEntity } from '@models/mailgun/mailgun-events.model';

/**
 * Don't forgot to add your Subscription in sns.ts > DependsOn and your queue in sns.ts > Queues
 */
export default {
  // SQS
  AddToBlacklistSubscription: {
    DependsOn: ['${self:custom.addToBlacklistQueue}'],
    Type: 'AWS::SNS::Subscription',
    Properties: {
      Protocol: 'sqs',
      Endpoint: {
        'Fn::GetAtt': ['${self:custom.addToBlacklistQueue}', 'Arn'],
      },
      TopicArn: {
        Ref: '${self:custom.mailingTopic}',
      },
      FilterPolicyScope: 'MessageBody',
      FilterPolicy: {
        'event-data': {
          event: mailgunEventsByEntity.blacklist,
        },
      },
      RedrivePolicy: {
        deadLetterTargetArn: {
          'Fn::GetAtt': ['${self:custom.mailingTopicRedirectionQueueDLQ}', 'Arn'],
        },
      },
    },
  },

  AddToBouncedSubscription: {
    DependsOn: ['${self:custom.addToBouncedQueue}'],
    Type: 'AWS::SNS::Subscription',
    Properties: {
      Protocol: 'sqs',
      Endpoint: {
        'Fn::GetAtt': ['${self:custom.addToBouncedQueue}', 'Arn'],
      },
      TopicArn: {
        Ref: '${self:custom.mailingTopic}',
      },
      FilterPolicyScope: 'MessageBody',
      FilterPolicy: {
        'event-data': {
          event: mailgunEventsByEntity.bounced,
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
          event: [{ 'anything-but': mailgunEventsByEntity.all }],
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
