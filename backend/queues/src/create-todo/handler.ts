import { log } from '@helpers/logger';
import { Todo } from '@models/todo.model';
import { eventToEventDLQs } from '@queues/dlq';
import { catchSQSEventError, getEventsFromSQSRecords, sendFailedEventsToDLQ } from '@queues/sqs';
import { Context, SQSEvent } from 'aws-lambda';

export async function main(event: SQSEvent, context: Context): Promise<void> {
  try {
    // Avoid creating a new mongoDb connection
    context.callbackWaitsForEmptyEventLoop = false;

    // Get events
    const events = getEventsFromSQSRecords<Todo>(event?.Records);
    if (!events.length) return;

    log.info({ events });

    // Add not processed messages to Dead Letter Queue
    const dlqName = process.env.CREATE_TODO_QUEUE_DLQ_NAME;
    const noneProcessed: Todo[] = [];
    const dlqMessages = eventToEventDLQs<Todo>(noneProcessed, dlqName, 'NOT_PROCESSED_MESSAGES_ERROR', {});
    await sendFailedEventsToDLQ(dlqMessages, context, dlqName);
  } catch (error) {
    const dlqName = process.env.CREATE_TODO_QUEUE_DLQ_NAME;
    await catchSQSEventError<Todo>(event, context, dlqName, { error });
  }
}
