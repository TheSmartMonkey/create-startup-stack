import { SendMessageBatchCommand, SendMessageBatchRequestEntry, SQSClient } from '@aws-sdk/client-sqs';
import { Mailgun } from '@models/mailgun/mailgun.model';
import { Context, SQSRecord } from 'aws-lambda';
import { Errors } from './errors';
import { logger } from './logger';
import { Utils } from './utils';

const sqs = new SQSClient({ region: process.env.AWS_REGION ?? 'eu-west-3' });

export class SqsUtils {
  static getMessageFromSQSRecord<T>(sqsRecord: SQSRecord): T | undefined {
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

  static getMessagesFromSQSRecords<T>(sqsRecords: SQSRecord[]): T[] {
    const messages = sqsRecords.map((sqsRecord) => this.getMessageFromSQSRecord(sqsRecord)) ?? [];
    logger.info({ messages });
    return messages as T[];
  }

  static removeDuplicateMailgunEvents(mailgunEvents: Mailgun[]): Mailgun[] {
    const mailgunEmailsByEventTypes = mailgunEvents.map((event) => `${event['event-data'].recipient}-${event['event-data'].event}`);
    const uniqueEmailsByEventTypes = [...new Set(mailgunEmailsByEventTypes)];
    return uniqueEmailsByEventTypes.map(
      (emailByEventType) =>
        mailgunEvents.find((event) => `${event['event-data'].recipient}-${event['event-data'].event}` === emailByEventType) ??
        ({} as Mailgun),
    );
  }

  async sendFailedEventsToDLQ<T>(messages: T[], context: Context, dlqName: string | undefined): Promise<void> {
    if (!messages.length) return;
    const entries: SendMessageBatchRequestEntry[] = messages.map((message) => {
      return { Id: Utils.generateUUID(), MessageBody: this.formatSQSMessage<T>(message) };
    });
    const params = new SendMessageBatchCommand({
      QueueUrl: this.getDLQUrl(context, dlqName),
      Entries: entries,
    });
    logger.info({ messages }, 'Sending messages to dlq...');
    const response = await sqs.send(params).catch((error) => logger.error(error));
    logger.info({ response }, 'Messages has been sent to dlq !');
  }

  private formatSQSMessage<T>(message: T): string {
    const foramtedMessage = {
      Message: JSON.stringify(message),
    };
    return JSON.stringify(foramtedMessage);
  }

  private getDLQUrl(context: Context, dlqName: string | undefined): string {
    if (!dlqName) throw new Error(Errors.ENV_VARIABLE_DLQ_NAME_UNDEFINED);
    const region = context.invokedFunctionArn.split(':')[3];
    const accountId = context.invokedFunctionArn.split(':')[4];
    return `https://sqs.${region}.amazonaws.com/${accountId}/${dlqName}`;
  }
}
