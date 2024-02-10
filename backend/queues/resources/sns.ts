export default {
  QueueServiceTopic: {
    Type: 'AWS::SNS::Topic',
    Properties: {
      TopicName: '${self:custom.queueServiceTopicName}',
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
        { Ref: '${self:custom.helloQueue}' },
        { Ref: '${self:custom.createTodoQueue}' },

        // SNS DLQ
        { Ref: '${self:custom.queueServiceTopicRedirectionQueueDLQ}' },
      ],
    },
    DependsOn: [
      'HelloSubscription',
      'CreateTodoSubscription',
    ],
  },
};
