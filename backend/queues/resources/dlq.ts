export default {
  AddToBlacklistQueueDLQ: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:custom.addToBlacklistQueueDLQName}',
      MessageRetentionPeriod: 1209600, // 14 days in seconds
    },
  },
  AddToBouncedQueueDLQ: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:custom.addToBouncedQueueDLQName}',
      MessageRetentionPeriod: 1209600, // 14 days in seconds
    },
  },
  AddToMailEventsQueueDLQ: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:custom.addToMailEventsQueueDLQName}',
      MessageRetentionPeriod: 1209600, // 14 days in seconds
    },
  },
  UpdateProsQueueDLQ: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:custom.updateProsQueueDLQName}',
    },
  },
  UnsubscribeNewsletterQueueDLQ: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:custom.unsubscribeNewsletterQueueDLQName}',
    },
  },
  MailingTopicRedirectionKeepAllMessagesQueue: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:custom.mailingTopicRedirectionKeepAllMessagesQueueName}',
      MessageRetentionPeriod: 1209600, // 14 days in seconds
    },
  },
  MailingTopicRedirectionKeepOtherEventsQueue: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:custom.mailingTopicRedirectionKeepOtherEventsQueueName}',
      MessageRetentionPeriod: 1209600, // 14 days in seconds
    },
  },
  MailingTopicRedirectionQueueDLQ: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:custom.mailingTopicRedirectionQueueDLQName}',
      MessageRetentionPeriod: 1209600, // 14 days in seconds
    },
  },
};
