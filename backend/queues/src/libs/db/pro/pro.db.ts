import { mongoDbInstance } from '@libs/adapter/mongodb.adapter';
import { logger } from '@libs/utils/logger';
import { DB_COLLECTIONS } from '@models/db.model';
import { Mailgun } from '@models/mailgun/mailgun.model';
import { UpdateResult } from 'mongodb';

export class ProDb {
  async unsubscribeProNewsLetter(mailgunEvents: Mailgun[]): Promise<Mailgun[]> {
    if (!mailgunEvents.length) return [];
    const noneProcessed: Mailgun[] = [];
    for (const mailgunEvent of mailgunEvents) {
      const email = mailgunEvent['event-data'].recipient;
      const response = await this.unsubscribeNewsletter(email);

      if (response.modifiedCount < 1) {
        logger.error({ email }, `Error : ${response.modifiedCount} data modified`);
        noneProcessed.push(mailgunEvent);
      } else {
        logger.info({ response }, `Unsubscribe pro newsletter`);
      }
    }
    return noneProcessed;
  }

  async updateManyEmailConfidence(mailgunEvents: Mailgun[], { emailConfidence }: { emailConfidence: 0 | 100 }): Promise<Mailgun[]> {
    if (!mailgunEvents.length) return [];
    const noneProcessed: Mailgun[] = [];
    for (const mailgunEvent of mailgunEvents) {
      const email = mailgunEvent['event-data'].recipient;
      const response = await this.updateEmailConfidence(email, emailConfidence);

      if (response.modifiedCount < 1) {
        logger.error({ email }, `Error : ${response.modifiedCount} data modified`);
        noneProcessed.push(mailgunEvent);
      } else {
        logger.info({ response }, `Update pro ${email} email confidence to ${emailConfidence}`);
      }
    }
    return noneProcessed;
  }

  private async unsubscribeNewsletter(email: string): Promise<UpdateResult> {
    return await mongoDbInstance.collection(DB_COLLECTIONS.Pros).updateMany({ email }, [
      {
        $set: { 'newsletter.isSubscribe': false, updated: new Date() },
      },
    ]);
  }

  private async updateEmailConfidence(email: string, emailConfidence: 0 | 100): Promise<UpdateResult> {
    return await mongoDbInstance.collection(DB_COLLECTIONS.Pros).updateMany({ email }, [
      {
        $set: {
          emailConfidence: {
            $cond: {
              if: { $ne: ['$emailConfidence', 0] },
              then: emailConfidence,
              else: 0,
            },
          },
          updated: new Date(),
        },
      },
    ]);
  }
}
