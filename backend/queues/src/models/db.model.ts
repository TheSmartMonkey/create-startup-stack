import { Utils } from '@libs/utils/utils';

export const DB_COLLECTIONS = {
  Bounced: Utils.getAnyByStageType({ prod: 'bouncedemails', dev: `bouncedemails-${process.env.AWS_STAGE}` }),
  BlackList: Utils.getAnyByStageType({ prod: 'blacklists', dev: `blacklists-${process.env.AWS_STAGE}` }),
  Pros: Utils.getAnyByStageType({ prod: 'pros', dev: `pros-${process.env.AWS_STAGE}` }),
  MailEvent: Utils.getAnyByStageType({ prod: 'mailevents', dev: `mailevents-${process.env.AWS_STAGE}` }),
  MailService: Utils.getAnyByStageType({ prod: 'mailservices', dev: `mailservices-${process.env.AWS_STAGE}` }),
  NewsletterStats: Utils.getAnyByStageType({ prod: 'newsletterstats', dev: `newsletterstats-${process.env.AWS_STAGE}` }),
  Innovation: Utils.getAnyByStageType({ prod: 'innovations', dev: `innovations-${process.env.AWS_STAGE}` }),
  WebhookDuplicates: Utils.getAnyByStageType({ prod: 'webhookduplicates', dev: `webhookduplicates-${process.env.AWS_STAGE}` }),
};
