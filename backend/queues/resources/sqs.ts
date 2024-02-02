export default {
  AddToBlacklistQueue: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:custom.addToBlacklistQueueName}',
      RedrivePolicy: {
        deadLetterTargetArn: {
          'Fn::GetAtt': ['${self:custom.addToBlacklistQueueDLQ}', 'Arn'],
        },
        maxReceiveCount: 3,
      },
      VisibilityTimeout: 900,
    },
  },
  AddToBouncedQueue: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:custom.addToBouncedQueueName}',
      RedrivePolicy: {
        deadLetterTargetArn: {
          'Fn::GetAtt': ['${self:custom.addToBouncedQueueDLQ}', 'Arn'],
        },
        maxReceiveCount: 3,
      },
      VisibilityTimeout: 900,
    },
  },
};
