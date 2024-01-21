import { MailgunTagsService } from '@libs/services/mailgun-tags';
import { MongoDbErrorCodes } from '@libs/utils/errors';
import { logger } from '@libs/utils/logger';
import { MODELS } from '@models/api.model';
import { MailgunClickedEventdata } from '@models/mailgun/mailgun-clicked.model';
import { MailgunPermanentFailureEventData } from '@models/mailgun/mailgun-permanent-failure';
import { MailgunTemporaryFailureEventData } from '@models/mailgun/mailgun-temporary-failure';
import { Mailgun } from '@models/mailgun/mailgun.model';
import { MailEvent } from '@models/mongoose/mail-events.model';
import { MailingServices } from '@models/services.model';

export class MailEventsDb {
  mailgunEventToDao(mailgunEvent: Mailgun): MailEvent {
    const data = mailgunEvent['event-data'];
    const tags = new MailgunTagsService().getAttributeValuesFromTags(data.tags);
    const emailEvent: MailEvent = {
      event: data.event,
      service: MailingServices.MAILGUN,
      messageId: data.message.headers['message-id'],
      recipient: data.recipient,
      metadata: {
        ...tags,
        url: (data as MailgunClickedEventdata)?.url,
      },
      innovation: tags?.innovation_id,
      campaign: tags?.campaign_id,
      batch: tags?.batch_id,
      step: tags?.step,
    };
    if ((data as MailgunTemporaryFailureEventData | MailgunPermanentFailureEventData).severity) {
      emailEvent.severity = (data as MailgunTemporaryFailureEventData | MailgunPermanentFailureEventData).severity;
    }
    return emailEvent;
  }

  mailgunEventsToDao(mailgunEvents: Mailgun[]): MailEvent[] {
    return mailgunEvents.map((mailgunEvent) => this.mailgunEventToDao(mailgunEvent));
  }

  /**
   * InsertMany MailEvents
   * @param noneDuplicates events to avoid inserting sqs retries
   * @returns noneProcessedEvent in case of an error
   */
  async insertMany(mailgunEvents: Mailgun[]): Promise<Mailgun[]> {
    try {
      if (!mailgunEvents.length) return [];
      const mailEvents = this.mailgunEventsToDao(mailgunEvents);
      logger.info({ mailEvents }, 'Dao model');
      const response = await MODELS.MailEvent.insertMany(mailEvents, { ordered: false });
      logger.info({ response }, 'Created MailEvents');
    } catch (error: any) {
      if (error?.code === MongoDbErrorCodes.DUPLICATE_KEY) {
        logger.info({ response: error?.insertedDocs }, 'Inserted only this events you have duplicate key values');
      } else {
        logger.error({ error }, 'Error : insertion');
        return mailgunEvents;
      }
    }
    return [];
  }
}
