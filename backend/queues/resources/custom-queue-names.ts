export default {
  // HelloQueue
  helloQueue: 'HelloQueue',
  helloQueueName: '${self:service}-hello-queue-${self:provider.stage}',
  helloQueueArn: {
    'Fn::Join': [':', ['arn', 'aws', 'sqs', { Ref: 'AWS::Region' }, { Ref: 'AWS::AccountId' }, '${self:custom.helloQueueName}']],
  },
  helloQueueDLQ: 'HelloQueueDLQ',
  helloQueueDLQName: '${self:service}-hello-queue-dlq-${self:provider.stage}',

  // CreateTodoQueue
  createTodoQueue: 'CreateTodoQueue',
  createTodoQueueName: '${self:service}-create-todo-queue-${self:provider.stage}',
  createTodoQueueArn: {
    'Fn::Join': [':', ['arn', 'aws', 'sqs', { Ref: 'AWS::Region' }, { Ref: 'AWS::AccountId' }, '${self:custom.createTodoQueueName}']],
  },
  createTodoQueueDLQ: 'CreateTodoQueueDLQ',
  createTodoQueueDLQName: '${self:service}-create-todo-queue-dlq-${self:provider.stage}',

  // QueueServiceTopicSNSRedirection
  queueServiceTopicRedirectionQueueDLQ: 'QueueServiceTopicRedirectionQueueDLQ',
  queueServiceTopicRedirectionQueueDLQName: '${self:service}-redirection-queue-dlq-${self:provider.stage}',
};
