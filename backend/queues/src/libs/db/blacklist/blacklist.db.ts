import { MailgunService } from '@libs/services/mailgun';
import { MongoDbErrorCodes } from '@libs/utils/errors';
import { logger } from '@libs/utils/logger';
import { MODELS } from '@models/api.model';
import { Mailgun } from '@models/mailgun/mailgun.model';
import { Blacklist, BlacklistReason } from '@models/mongoose/blacklist.model';

export class BlacklistDb {
  mailgunEventToDao(mailgunEvent: Mailgun): Blacklist {
    const data = mailgunEvent['event-data'];
    return {
      email: data.recipient,
      altEmail: data.recipient,
      domain: data.recipient.split('@')[1],
      reason: 'reason' in data ? (data.reason as BlacklistReason) : BlacklistReason.MANUALLY_ADDED,
      umiDomain: new MailgunService().getEmailDomainFromMailgunEvent(mailgunEvent),
    };
  }

  mailgunEventsToDao(mailgunEvents: Mailgun[]): Blacklist[] {
    return mailgunEvents.map((mailgunEvent) => this.mailgunEventToDao(mailgunEvent));
  }

  /**
   * InsertMany Blacklist
   * @param noneDuplicates events to avoid inserting sqs retries
   * @returns noneProcessedEvent in case of an error
   */
  async insertMany(mailgunEvents: Mailgun[]): Promise<Mailgun[]> {
    try {
      if (!mailgunEvents.length) return [];
      const blacklist = this.mailgunEventsToDao(mailgunEvents);
      logger.info({ blacklist }, 'Dao model');
      const response = await MODELS.Blacklist.insertMany(blacklist, { ordered: false });
      logger.info({ response }, 'Created Blacklist');
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
