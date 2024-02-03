export default {
  HelloQueue: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:custom.helloQueueName}',
      RedrivePolicy: {
        deadLetterTargetArn: {
          'Fn::GetAtt': ['${self:custom.helloQueueDLQ}', 'Arn'],
        },
        maxReceiveCount: 3,
      },
      VisibilityTimeout: 900,
    },
  },
  CreateTodoQueue: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:custom.createTodoQueueName}',
      RedrivePolicy: {
        deadLetterTargetArn: {
          'Fn::GetAtt': ['${self:custom.createTodoQueueDLQ}', 'Arn'],
        },
        maxReceiveCount: 3,
      },
      VisibilityTimeout: 900,
    },
  },
};
