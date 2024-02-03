export enum Queues {
  HELLO_QUEUE = 'HelloQueue',
  CREATE_TODO_QUEUE = 'CreateTotoQueue',
  ALL = 'all',
}

export enum QueueEvent {
  HELLO_EVENT = 'helloEvent',
  CREATE_TODO_EVENT = 'createTodoEvent',
}

export const QUEUE_EVENTS: Record<Queues, QueueEvent[]> = {
  [Queues.HELLO_QUEUE]: [QueueEvent.HELLO_EVENT],
  [Queues.CREATE_TODO_QUEUE]: [QueueEvent.CREATE_TODO_EVENT],
  [Queues.ALL]: Object.values(QueueEvent),
};
