import { generateUniqueId } from '@helpers/helper';
import { QueueServiceQueueEventType } from '@models/queues/queue-service-events';
import { SQSRecord } from 'aws-lambda';

export function fakeSqsRecord<T>(event: T, partial?: Partial<SQSRecord>): SQSRecord {
  return {
    messageId: generateUniqueId(),
    receiptHandle: '',
    body: JSON.stringify({
      Message: JSON.stringify(event),
    }),
    attributes: {
      ApproximateReceiveCount: '',
      SentTimestamp: '',
      SenderId: '',
      ApproximateFirstReceiveTimestamp: '',
    },
    messageAttributes: {},
    md5OfBody: '',
    eventSource: '',
    eventSourceARN: '',
    awsRegion: '',
    ...partial,
  };
}

export function fakeSqsEvent<T>(
  event: T,
  eventType: QueueServiceQueueEventType,
): {
  event: T;
  eventType: QueueServiceQueueEventType;
} {
  return {
    event,
    eventType,
  };
}
