export enum QueueServiceQueues {
  HELLO_QUEUE = 'HelloQueue',
  CREATE_TODO_QUEUE = 'CreateTodoQueue',
  ALL = 'all',
}

export enum QueueServiceQueueEvent {
  HELLO_EVENT = 'helloEvent',
  CREATE_TODO_EVENT = 'createTodoEvent',
}

export const QUEUE_SERVICE_QUEUE_EVENTS: Record<QueueServiceQueues, QueueServiceQueueEvent[]> = {
  [QueueServiceQueues.HELLO_QUEUE]: [QueueServiceQueueEvent.HELLO_EVENT],
  [QueueServiceQueues.CREATE_TODO_QUEUE]: [QueueServiceQueueEvent.CREATE_TODO_EVENT],
  [QueueServiceQueues.ALL]: Object.values(QueueServiceQueueEvent),
};

export type SendSNSEvent<T> = {
  events: T[];
  topicArn: string;
  eventType: QueueServiceQueueEvent;
};
