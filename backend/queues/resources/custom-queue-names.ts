export default {
  // AddToBlacklistQueue
  addToBlacklistQueue: 'AddToBlacklistQueue',
  addToBlacklistQueueName: '${self:service}-add-to-blacklist-queue-${self:provider.stage}',
  addToBlacklistQueueArn: {
    'Fn::Join': [':', ['arn', 'aws', 'sqs', { Ref: 'AWS::Region' }, { Ref: 'AWS::AccountId' }, '${self:custom.addToBlacklistQueueName}']],
  },
  addToBlacklistQueueDLQ: 'AddToBlacklistQueueDLQ',
  addToBlacklistQueueDLQName: '${self:service}-add-to-blacklist-queue-dlq-${self:provider.stage}',

  // AddToBouncedQueue
  addToBouncedQueue: 'AddToBouncedQueue',
  addToBouncedQueueName: '${self:service}-add-to-bounced-queue-${self:provider.stage}',
  addToBouncedQueueArn: {
    'Fn::Join': [':', ['arn', 'aws', 'sqs', { Ref: 'AWS::Region' }, { Ref: 'AWS::AccountId' }, '${self:custom.addToBouncedQueueName}']],
  },
  addToBouncedQueueDLQ: 'AddToBouncedQueueDLQ',
  addToBouncedQueueDLQName: '${self:service}-add-to-bounced-queue-dlq-${self:provider.stage}',

  // addToMailEventsQueue
  addToMailEventsQueue: 'AddToMailEventsQueue',
  addToMailEventsQueueName: '${self:service}-add-to-mail-events-queue-${self:provider.stage}',
  addToMailEventsQueueArn: {
    'Fn::Join': [':', ['arn', 'aws', 'sqs', { Ref: 'AWS::Region' }, { Ref: 'AWS::AccountId' }, '${self:custom.addToMailEventsQueueName}']],
  },
  addToMailEventsQueueDLQ: 'AddToMailEventsQueueDLQ',
  addToMailEventsQueueDLQName: '${self:service}-add-to-mail-events-queue-dlq-${self:provider.stage}',

  // updateProsQueue
  updateProsQueue: 'UpdateProsQueue',
  updateProsQueueName: '${self:service}-update-pros-queue-${self:provider.stage}',
  updateProsQueueArn: {
    'Fn::Join': [':', ['arn', 'aws', 'sqs', { Ref: 'AWS::Region' }, { Ref: 'AWS::AccountId' }, '${self:custom.updateProsQueueName}']],
  },
  updateProsQueueDLQ: 'UpdateProsQueueDLQ',
  updateProsQueueDLQName: '${self:service}-update-pros-queue-dlq-${self:provider.stage}',

  // unsubscribeNewsletterQueue
  unsubscribeNewsletterQueue: 'UnsubscribeNewsletterQueue',
  unsubscribeNewsletterQueueName: '${self:service}-unsubscribe-newsletter-queue-${self:provider.stage}',
  unsubscribeNewsletterQueueArn: {
    'Fn::Join': [
      ':',
      ['arn', 'aws', 'sqs', { Ref: 'AWS::Region' }, { Ref: 'AWS::AccountId' }, '${self:custom.unsubscribeNewsletterQueueName}'],
    ],
  },
  unsubscribeNewsletterQueueDLQ: 'UnsubscribeNewsletterQueueDLQ',
  unsubscribeNewsletterQueueDLQName: '${self:service}-unsubscribe-newsletter-queue-dlq-${self:provider.stage}',

  // MailingTopicSNSRedirection
  mailingTopicRedirectionKeepOtherEventsQueue: 'MailingTopicRedirectionKeepOtherEventsQueue',
  mailingTopicRedirectionKeepOtherEventsQueueName: '${self:service}-redirection-keep-other-events-queue-${self:provider.stage}',
  mailingTopicRedirectionKeepAllMessagesQueue: 'MailingTopicRedirectionKeepAllMessagesQueue',
  mailingTopicRedirectionKeepAllMessagesQueueName: '${self:service}-redirection-keep-all-messages-queue-${self:provider.stage}',
  mailingTopicRedirectionQueueDLQ: 'MailingTopicRedirectionQueueDLQ',
  mailingTopicRedirectionQueueDLQName: '${self:service}-redirection-queue-dlq-${self:provider.stage}',
};
