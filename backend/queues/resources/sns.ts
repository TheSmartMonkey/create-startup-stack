export default {
  MailingTopic: {
    Type: 'AWS::SNS::Topic',
    Properties: {
      TopicName: '${self:custom.mailingTopicName}',
    },
  },
  SnsQueuePolicy: {
    Type: 'AWS::SQS::QueuePolicy',
    Properties: {
      PolicyDocument: {
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              Service: 'sns.amazonaws.com',
            },
            Action: 'SQS:SendMessage',
            Resource: '*',
          },
        ],
      },
      Queues: [
        { Ref: '${self:custom.addToBlacklistQueue}' },
        { Ref: '${self:custom.addToBouncedQueue}' },
        { Ref: '${self:custom.mailingTopicRedirectionKeepOtherEventsQueue}' },
        { Ref: '${self:custom.mailingTopicRedirectionKeepAllMessagesQueue}' },
        { Ref: '${self:custom.mailingTopicRedirectionQueueDLQ}' },
      ],
    },
    DependsOn: [
      'AddToBlacklistSubscription',
      'AddToBouncedSubscription',
      'MailingTopicRedirectionKeepAllMessagesSubscription',
      'MailingTopicRedirectionKeepOtherEventsSubscription',
    ],
  },
};
