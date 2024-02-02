import { EventDLQ } from '@models/global/queues.model';

export function eventToEventDLQs<T>(
  events: T[],
  dlqName: string | undefined,
  errorCode: Uppercase<string>,
  { error }: { error?: any },
): EventDLQ<T>[] {
  return events.map((mailgunEvent) => eventToEventDLQ(mailgunEvent, dlqName, errorCode, { error }));
}

function eventToEventDLQ<T>(event: T, dlqName: string | undefined, errorCode: Uppercase<string>, { error }: { error?: any }): EventDLQ<T> {
  return {
    ...event,
    dlqError: {
      dlqName: dlqName ?? 'ENV_VARIABLE_DLQ_NAME_UNDEFINED',
      errorCode,
      error,
    },
  };
}
