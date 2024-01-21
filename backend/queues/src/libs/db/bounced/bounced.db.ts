import { MongoDbErrorCodes } from '@libs/utils/errors';
import { logger } from '@libs/utils/logger';
import { MODELS } from '@models/api.model';
import { Mailgun } from '@models/mailgun/mailgun.model';
import { Bounced } from '@models/mongoose/bounced.model';

export class BouncedDb {
  mailgunEventToDao(mailgunEvent: Mailgun): Bounced {
    const data = mailgunEvent['event-data'];
    return {
      email: data.recipient,
      domain: data.recipient.split('@')[1],
    };
  }

  mailgunEventsToDao(mailgunEvents: Mailgun[]): Bounced[] {
    return mailgunEvents.map((mailgunEvent) => this.mailgunEventToDao(mailgunEvent));
  }

  /**
   * InsertMany bounced events
   * @param noneDuplicates events to avoid inserting sqs retries
   * @returns noneProcessedEvent in case of an error
   */
  async insertMany(mailgunEvents: Mailgun[]): Promise<Mailgun[]> {
    try {
      if (!mailgunEvents.length) return [];
      const bounced = this.mailgunEventsToDao(mailgunEvents);
      logger.info({ bounced }, 'Dao model');
      const response = await MODELS.Bounced.insertMany(bounced, { ordered: false });
      logger.info({ response }, 'Created bounced');
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
