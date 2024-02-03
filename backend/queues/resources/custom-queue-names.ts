export default {
  // HelloQueue
  helloQueue: 'HelloQueue',
  helloQueueName: '${self:service}-add-to-blacklist-queue-${self:provider.stage}',
  helloQueueArn: {
    'Fn::Join': [':', ['arn', 'aws', 'sqs', { Ref: 'AWS::Region' }, { Ref: 'AWS::AccountId' }, '${self:custom.helloQueueName}']],
  },
  helloQueueDLQ: 'HelloQueueDLQ',
  helloQueueDLQName: '${self:service}-add-to-blacklist-queue-dlq-${self:provider.stage}',

  // CreateTodoQueue
  createTodoQueue: 'CreateTodoQueue',
  createTodoQueueName: '${self:service}-add-to-bounced-queue-${self:provider.stage}',
  createTodoQueueArn: {
    'Fn::Join': [':', ['arn', 'aws', 'sqs', { Ref: 'AWS::Region' }, { Ref: 'AWS::AccountId' }, '${self:custom.createTodoQueueName}']],
  },
  createTodoQueueDLQ: 'CreateTodoQueueDLQ',
  createTodoQueueDLQName: '${self:service}-add-to-bounced-queue-dlq-${self:provider.stage}',

  // MailingTopicSNSRedirection
  mailingTopicRedirectionKeepOtherEventsQueue: 'MailingTopicRedirectionKeepOtherEventsQueue',
  mailingTopicRedirectionKeepOtherEventsQueueName: '${self:service}-redirection-keep-other-events-queue-${self:provider.stage}',
  mailingTopicRedirectionKeepAllMessagesQueue: 'MailingTopicRedirectionKeepAllMessagesQueue',
  mailingTopicRedirectionKeepAllMessagesQueueName: '${self:service}-redirection-keep-all-messages-queue-${self:provider.stage}',
  mailingTopicRedirectionQueueDLQ: 'MailingTopicRedirectionQueueDLQ',
  mailingTopicRedirectionQueueDLQName: '${self:service}-redirection-queue-dlq-${self:provider.stage}',
};
