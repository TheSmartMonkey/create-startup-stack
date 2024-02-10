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
  QueueServiceTopicRedirectionQueueDLQ: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:custom.queueServiceTopicRedirectionQueueDLQName}',
      MessageRetentionPeriod: 1209600, // 14 days in seconds
    },
  },
};
