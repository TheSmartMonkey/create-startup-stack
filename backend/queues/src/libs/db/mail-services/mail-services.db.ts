import { logger } from '@libs/utils/logger';
import { MODELS } from '@models/api.model';
import { Mailgun } from '@models/mailgun/mailgun.model';
import { DB_COLLECTIONS } from '@models/db.model';
import { Errors } from '@libs/utils/errors';
import { PipelineStage } from 'mongoose';

export class MailServicesDb {
  private getMessageIdFromMailgunEvents(mailgunEvents: Mailgun[]): string[] {
    const messageIds: string[] = [];
    if (!mailgunEvents.length) return messageIds;
    mailgunEvents.forEach((mailgunEvent) => {
      if (mailgunEvent['event-data'].message?.headers && mailgunEvent['event-data'].message.headers['message-id']) {
        messageIds.push(mailgunEvent['event-data'].message.headers['message-id']);
      }
    });
    return messageIds;
  }

  /**
   *
   * @param mailgunEvents
   */
  async updateUnsubscriptionOfNewsletterStats(mailgunEvents: Mailgun[]): Promise<void> {
    try {
      logger.info({ mailgunEvents }, 'updateUnsubscriptionOfNewsletterStats begins here: ');
      if (!mailgunEvents.length) return;
      const messageIds = this.getMessageIdFromMailgunEvents(mailgunEvents);
      logger.info({ messageIds }, 'Message ids of subscribed events');
      const newsletterStatsCollection = DB_COLLECTIONS.NewsletterStats;
      logger.info({ newsletterStatsCollection }, 'NewsletterStat collection name');
      if (!messageIds?.length) return;
      const pipeline: PipelineStage[] = [
        {
          $match: {
            messageId: { $in: messageIds },
            tags: 'type_recontact',
          },
        },
        {
          $addFields: {
            tag: {
              $arrayElemAt: ['$tags', 1],
            },
          },
        },
        {
          $project: {
            innovation: {
              $substr: ['$tag', 11, 24],
            },
          },
        },
        {
          $group: {
            _id: '$innovation',
            unsubscribes: {
              $sum: 1,
            },
          },
        },
        {
          $addFields: {
            innovation: {
              $toObjectId: '$_id',
            },
          },
        },
        {
          $lookup: {
            from: newsletterStatsCollection,
            localField: 'innovation',
            foreignField: 'innovation',
            as: 'newsletterstats',
          },
        },
        {
          $unwind: {
            path: '$newsletterstats',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            'newsletterstats.nbrUnsubscription': {
              $ifNull: [
                {
                  $add: ['$newsletterstats.nbrUnsubscription', '$unsubscribes'],
                },
                '$unsubscribes',
              ],
            },
            'newsletterstats.innovation': '$innovation',
          },
        },
        {
          $replaceRoot: {
            newRoot: '$newsletterstats',
          },
        },
        {
          $merge: {
            into: newsletterStatsCollection,
            on: '_id',
            whenMatched: 'merge',
            whenNotMatched: 'insert',
          },
        },
      ];
      await MODELS.MailService.aggregate(pipeline);
      logger.info({ messageIds }, `${messageIds.length} MailEvents are processed for unsubscription of newsletter stats`);
    } catch (error: any) {
      logger.error({ error }, 'Error : aggregation of MailServices Collection');
      throw new Error(Errors.MAIL_SERVICES_AGGREGATION_FAILED);
    }
  }
}
