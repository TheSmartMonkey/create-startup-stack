import { MailgunEntityEnum, mailgunEventsByEntity } from '@models/mailgun/mailgun-events.model';

// const ALARM_EMAIL_LAURENT = 'lvandelle@umi-innovation.com';
// const ALARM_EMAIL_MORGANE = 'mdarrigade@umi-innovation.com';

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
  AddToMailEventsSubscription: {
    DependsOn: ['${self:custom.addToMailEventsQueue}'],
    Type: 'AWS::SNS::Subscription',
    Properties: {
      Protocol: 'sqs',
      Endpoint: {
        'Fn::GetAtt': ['${self:custom.addToMailEventsQueue}', 'Arn'],
      },
      TopicArn: {
        Ref: '${self:custom.mailingTopic}',
      },
      FilterPolicyScope: 'MessageBody',
      FilterPolicy: {
        'event-data': {
          event: mailgunEventsByEntity.all,
        },
      },
      RedrivePolicy: {
        deadLetterTargetArn: {
          'Fn::GetAtt': ['${self:custom.mailingTopicRedirectionQueueDLQ}', 'Arn'],
        },
      },
    },
  },
  UpdateProsSubscription: {
    DependsOn: ['${self:custom.updateProsQueue}'],
    Type: 'AWS::SNS::Subscription',
    Properties: {
      Protocol: 'sqs',
      Endpoint: {
        'Fn::GetAtt': ['${self:custom.updateProsQueue}', 'Arn'],
      },
      TopicArn: {
        Ref: '${self:custom.mailingTopic}',
      },
      FilterPolicyScope: 'MessageBody',
      FilterPolicy: {
        'event-data': {
          event: mailgunEventsByEntity.pro,
        },
      },
      RedrivePolicy: {
        deadLetterTargetArn: {
          'Fn::GetAtt': ['${self:custom.mailingTopicRedirectionQueueDLQ}', 'Arn'],
        },
      },
    },
  },
  UnsubscribeNewsletterSubscription: {
    DependsOn: ['${self:custom.unsubscribeNewsletterQueue}'],
    Type: 'AWS::SNS::Subscription',
    Properties: {
      Protocol: 'sqs',
      Endpoint: {
        'Fn::GetAtt': ['${self:custom.unsubscribeNewsletterQueue}', 'Arn'],
      },
      TopicArn: {
        Ref: '${self:custom.mailingTopic}',
      },
      FilterPolicyScope: 'MessageBody',
      FilterPolicy: {
        'event-data': {
          event: mailgunEventsByEntity.unsubscribe,
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

  // TODO: Alarms don't works as expected
  // Email (disabled for now)
  // ...Utils.getAnyByStageType({
  //   prod: {
  //     DLQAlarmLaurentSubscription: {
  //       DependsOn: ['${self:custom.mailingTopic}'],
  //       Type: 'AWS::SNS::Subscription',
  //       Properties: {
  //         Protocol: 'email',
  //         Endpoint: ALARM_EMAIL_LAURENT,
  //         TopicArn: {
  //           Ref: '${self:custom.mailingTopic}',
  //         },
  //       },
  //     },
  //     DLQAlarmMorganeSubscription: {
  //       DependsOn: ['${self:custom.mailingTopic}'],
  //       Type: 'AWS::SNS::Subscription',
  //       Properties: {
  //         Protocol: 'email',
  //         Endpoint: ALARM_EMAIL_MORGANE,
  //         TopicArn: {
  //           Ref: '${self:custom.mailingTopic}',
  //         },
  //       },
  //     },
  //   },
  //   dev: {},
  // }),
};
