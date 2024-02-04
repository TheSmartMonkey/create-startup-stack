import { SQSClient, SendMessageBatchCommand, SendMessageBatchRequestEntry } from '@aws-sdk/client-sqs';
import { generateUniqueId } from '@helpers/helper';
import { logger } from '@helpers/logger';
import { Context, SQSEvent, SQSRecord } from 'aws-lambda';
import { eventToEventDLQs } from './dlq';

const SQS = new SQSClient({ region: process.env.AWS_REGION ?? 'eu-west-3' });

export function getEventsFromSQSRecords<T>(sqsRecords: SQSRecord[]): T[] {
  const events = sqsRecords.map((sqsRecord) => getEventFromSQSRecord(sqsRecord)) ?? [];
  logger.info({ events });
  return events as T[];
}

export async function sendFailedEventsToDLQ<T>(events: T[], context: Context, dlqName: string | undefined): Promise<void> {
  if (!events.length) return;
  const entries: SendMessageBatchRequestEntry[] = events.map((event) => {
    return { Id: generateUniqueId(), MessageBody: formatSQSEvent<T>(event) };
  });
  const params = new SendMessageBatchCommand({
    QueueUrl: getDLQUrl(context, dlqName),
    Entries: entries,
  });
  logger.info({ events }, 'Sending events to dlq...');
  const response = await SQS.send(params).catch((error) => logger.error(error));
  logger.info({ response }, 'Events has been sent to dlq !');
}

export async function catchSQSEventError<T>(
  event: SQSEvent,
  context: Context,
  dlqName: string | undefined,
  { error }: { error?: any },
): Promise<void> {
  logger.error({ error });
  const messages = getEventsFromSQSRecords<T>(event?.Records);
  const dlqMessages = eventToEventDLQs(messages, dlqName, 'UNKNOWN_ERROR', { error });
  await sendFailedEventsToDLQ(dlqMessages, context, dlqName);
}

export async function sendEventToQueue<T>(events: T[], context: Context, queueName: string) {
  if (!events.length) return;
  const entries: SendMessageBatchRequestEntry[] = events.map((event) => {
    return { Id: generateUniqueId(), MessageBody: formatSQSEvent<T>(event) };
  });
  const params = new SendMessageBatchCommand({
    QueueUrl: getDLQUrl(context, queueName),
    Entries: entries,
  });
  logger.info({ events }, 'Sending events to dlq...');
  const response = await SQS.send(params).catch((error) => logger.error(error));
  logger.info({ response }, 'Events has been sent to dlq !');
}

function getEventFromSQSRecord<T>(sqsRecord: SQSRecord): T | undefined {
  try {
    if (sqsRecord?.body) {
      const body = JSON.parse(sqsRecord?.body);
      return JSON.parse(body.Message);
    }
  } catch {
    logger.error(sqsRecord?.body);
  }
  return undefined;
}

function formatSQSEvent<T>(event: T): string {
  const foramtedEvent = {
    Message: JSON.stringify(event),
  };
  return JSON.stringify(foramtedEvent);
}

function getDLQUrl(context: Context, dlqName: string | undefined): string {
  if (!dlqName) throw new Error('ENV_VARIABLE_DLQ_NAME_UNDEFINED');
  const region = context.invokedFunctionArn.split(':')[3];
  const accountId = context.invokedFunctionArn.split(':')[4];
  return `https://sqs.${region}.amazonaws.com/${accountId}/${dlqName}`;
}
