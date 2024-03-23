import { log } from '@helpers/logger';
import { Hello } from '@models/hello.model';
import { eventToEventDLQs } from '@queues/dlq';
import { catchSQSEventError, getEventsFromSQSRecords, sendFailedEventsToDLQ } from '@queues/sqs';
import { Context, SQSEvent } from 'aws-lambda';

export async function main(event: SQSEvent, context: Context): Promise<void> {
  try {
    // Avoid creating a new mongoDb connection
    context.callbackWaitsForEmptyEventLoop = false;

    // Get events
    const events = getEventsFromSQSRecords<Hello>(event?.Records);
    if (!events.length) return;

    log.info({ events });

    // Add not processed messages to Dead Letter Queue
    const dlqName = process.env.HELLO_QUEUE_DLQ_NAME;
    const noneProcessed: Hello[] = [];
    const dlqMessages = eventToEventDLQs(noneProcessed, dlqName, 'NOT_PROCESSED_MESSAGES_ERROR', {});
    await sendFailedEventsToDLQ(dlqMessages, context, dlqName);
  } catch (error) {
    const dlqName = process.env.HELLO_QUEUE_DLQ_NAME;
    await catchSQSEventError<Hello>(event, context, dlqName, { error });
  }
}
