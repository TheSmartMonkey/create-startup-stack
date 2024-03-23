export enum QueueServiceQueues {
  HELLO_QUEUE = 'HELLO_QUEUE',
  CREATE_TODO_QUEUE = 'CREATE_TODO_QUEUE',
  ALL = 'ALL',
}

export enum QueueServiceQueueEventType {
  HELLO_EVENT = 'HELLO_EVENT',
  CREATE_TODO_EVENT = 'CREATE_TODO_EVENT',
}

export const QUEUE_SERVICE_QUEUE_EVENTS: Record<QueueServiceQueues, QueueServiceQueueEventType[]> = {
  [QueueServiceQueues.HELLO_QUEUE]: [QueueServiceQueueEventType.HELLO_EVENT],
  [QueueServiceQueues.CREATE_TODO_QUEUE]: [QueueServiceQueueEventType.CREATE_TODO_EVENT],
  [QueueServiceQueues.ALL]: Object.values(QueueServiceQueueEventType),
};

export type SendSNSEvent<T> = {
  events: T[];
  topicArn: string;
  eventType: QueueServiceQueueEventType;
};
