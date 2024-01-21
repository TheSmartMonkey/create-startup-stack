export enum Errors {
  UNKNOWN_ERROR = 'UnknownError',
  NOT_PROCESSED_MESSAGES_ERROR = 'NotProcessedMessagesError',
  ENV_VARIABLE_DLQ_NAME_UNDEFINED = 'EnvVariableDlqNameUndefined',
  SQS_RECORD_MESSAGE_ID_NOT_FOUND = 'SqsRecordMessageIdNotFound',
  MAIL_SERVICES_AGGREGATION_FAILED = 'updateUnsubscriptionOfNewsletterStatsFailed',
}

export enum MongoDbErrorCodes {
  DUPLICATE_KEY = 11000,
}
