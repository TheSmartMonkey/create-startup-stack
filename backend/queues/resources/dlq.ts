export default {
  HelloQueueDLQ: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:custom.helloQueueDLQName}',
      MessageRetentionPeriod: 1209600, // 14 days in seconds
    },
  },
  CreateTodoQueueDLQ: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:custom.createTodoQueueDLQName}',
      MessageRetentionPeriod: 1209600, // 14 days in seconds
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
