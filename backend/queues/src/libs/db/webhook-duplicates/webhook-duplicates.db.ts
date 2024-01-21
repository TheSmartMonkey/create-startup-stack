import { MailgunService } from '@libs/services/mailgun';
import { logger } from '@libs/utils/logger';
import { Utils } from '@libs/utils/utils';
import { MODELS } from '@models/api.model';
import { Mailgun } from '@models/mailgun/mailgun.model';
import { WebhookDuplicates } from '@models/mongoose/webhook-duplicates.model';
import { Context, SQSRecord } from 'aws-lambda';

/**
 * Duplictes of lambda to monitor sqs retries
 */
export class WebhookDuplicatesDb {
  mailgunEventToDao(mailgunEvent: Mailgun, sqsRecords: SQSRecord[], context: Context): WebhookDuplicates {
    const data = mailgunEvent['event-data'];
    const sqsMessageId = new MailgunService().getSqsMessageIdByEmailAndEventType(sqsRecords, data.recipient, data.event);
    return {
      sqsMessageId,
      event: data.event,
      email: data.recipient,
      mailgunMessageId: data?.message?.headers?.['message-id'] ?? 'unknown',
      source: context.functionName,
      countRetries: 1,
    };
  }

  mailgunEventsToDao(mailgunEvents: Mailgun[], sqsRecords: SQSRecord[], context: Context): WebhookDuplicates[] {
    return mailgunEvents.map((mailgunEvent) => this.mailgunEventToDao(mailgunEvent, sqsRecords, context));
  }

  webhookDuplicatesToMailgunEvents(mailgunEvents: Mailgun[], webhookDuplicates: WebhookDuplicates[]): Mailgun[] {
    const duplicateEmailsByEventTypes = webhookDuplicates.map((webhookDuplicate) => `${webhookDuplicate.email}-${webhookDuplicate.event}`);
    return mailgunEvents.filter((mailgunEvent) => {
      const emailByEventType = `${mailgunEvent['event-data'].recipient}-${mailgunEvent['event-data'].event}`;
      return duplicateEmailsByEventTypes.includes(emailByEventType);
    });
  }

  async getDuplicatesAndNoneDuplicates(
    mailgunEvents: Mailgun[],
    sqsRecords: SQSRecord[],
    context: Context,
  ): Promise<{ duplicates: WebhookDuplicates[]; noneDuplicates: WebhookDuplicates[] }> {
    const eventsDao = this.mailgunEventsToDao(mailgunEvents, sqsRecords, context);
    const messageIds = eventsDao.map((event) => event.sqsMessageId);
    const duplicates = await MODELS.WebhookDuplicates.find({ sqsMessageId: { $in: messageIds } });
    const noneDuplicates = this.getNoneDuplicatesFromDuplicates(eventsDao, messageIds, duplicates);
    logger.info({ duplicates });
    logger.info({ noneDuplicates });
    return { duplicates, noneDuplicates };
  }

  async insertManyOrUpdateManyCountWhenExist(duplicates: WebhookDuplicates[], noneDuplicates: WebhookDuplicates[]): Promise<void> {
    await this.insertManyNoneDuplicateEvents(noneDuplicates);
    await this.updateManyDuplicateEvents(duplicates);
  }

  private getNoneDuplicatesFromDuplicates(
    events: WebhookDuplicates[],
    messageIds: string[],
    duplicates: WebhookDuplicates[],
  ): WebhookDuplicates[] {
    const duplicatesMessageId = duplicates.map((event) => event.sqsMessageId);
    const noneDuplicatesMessageIds = Utils.getDifferenceOfTwoLists(messageIds, duplicatesMessageId);
    return events.filter((event) => noneDuplicatesMessageIds.includes(event.sqsMessageId));
  }

  private async insertManyNoneDuplicateEvents(noneDuplicatesEvents: WebhookDuplicates[]): Promise<void> {
    if (!noneDuplicatesEvents.length) return;
    const response = await MODELS.WebhookDuplicates.insertMany(noneDuplicatesEvents);
    logger.info({ response }, 'Created none duplicates events');
  }

  private async updateManyDuplicateEvents(duplicates: WebhookDuplicates[]): Promise<void> {
    if (!duplicates.length) return;
    const duplicatesMessageIds = duplicates.map((duplicate) => duplicate.sqsMessageId);
    const response = await MODELS.WebhookDuplicates.updateMany(
      { sqsMessageId: { $in: duplicatesMessageIds } },
      { $inc: { countRetries: 1 } },
    );
    logger.info({ response }, 'Update duplicates events');
  }
}
