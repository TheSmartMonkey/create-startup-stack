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
  AddToMailEventsQueue: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:custom.addToMailEventsQueueName}',
      RedrivePolicy: {
        deadLetterTargetArn: {
          'Fn::GetAtt': ['${self:custom.addToMailEventsQueueDLQ}', 'Arn'],
        },
        maxReceiveCount: 3,
      },
      VisibilityTimeout: 900,
    },
  },
  UpdateProsQueue: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:custom.updateProsQueueName}',
      RedrivePolicy: {
        deadLetterTargetArn: {
          'Fn::GetAtt': ['${self:custom.updateProsQueueDLQ}', 'Arn'],
        },
        maxReceiveCount: 3,
      },
      VisibilityTimeout: 900,
    },
  },
  UnsubscribeNewsletterQueue: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      QueueName: '${self:custom.unsubscribeNewsletterQueueName}',
      RedrivePolicy: {
        deadLetterTargetArn: {
          'Fn::GetAtt': ['${self:custom.unsubscribeNewsletterQueueDLQ}', 'Arn'],
        },
        maxReceiveCount: 3,
      },
      VisibilityTimeout: 900,
    },
  },
};
