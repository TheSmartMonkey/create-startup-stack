import { logger } from '@libs/utils/logger';
import { MailgunTags, MailgunTagTypeFormats } from '@models/mailgun/mailgun-tags.model';

export class MailgunTagsService {
  mailgunTags: MailgunTags = {};

  /**
   * Mailgun tags are the information we pass via the mailEvent as a concatenated string
   * @param tags most cases [campaignId, batch_batchId_step, campanyName]
   * @returns MailgunTags as a dict
   */
  getAttributeValuesFromTags(tags: string[]): MailgunTags {
    if (tags.length > 3) {
      logger.error(`tags length is too long ${tags.length} max is 3 tags`);
      return {};
    }
    for (const tag of tags) {
      this.setMailgunTagByTagType(tag);
    }
    return this.mailgunTags;
  }

  private setMailgunTagByTagType(tag: string): void {
    const tagFormat = this.getTagTypeFormat(tag);
    if (tagFormat === MailgunTagTypeFormats.UNDEFINED) return;

    switch (tagFormat) {
      case MailgunTagTypeFormats.BATCH:
        this.getBatchTagValues(tag);
        break;
      case MailgunTagTypeFormats.CAMPAIGN:
        this.getCampaignIdTag(tag);
        break;
      case MailgunTagTypeFormats.RECONTACT:
        this.getRecontactTag(tag);
        break;
      case MailgunTagTypeFormats.TYPE:
        this.getTypeTag(tag);
        break;
      case MailgunTagTypeFormats.NOTIFICATION:
        this.getNotificationTag(tag);
        break;
    }
  }

  private getBatchTagValues(tag: string): void {
    const [, batchId, step = '0'] = tag.split('_');
    this.mailgunTags.batch_id = batchId;
    this.mailgunTags.step = parseInt(step);
  }

  private getCampaignIdTag(tag: string): void {
    this.mailgunTags.campaign_id = tag;
  }

  private getRecontactTag(tag: string): void {
    const [innovation, campaign, quiz] = tag.split('&');
    if (innovation) this.mailgunTags.innovation_id = innovation.split('_')[1];
    if (campaign) this.mailgunTags.campaign_id = campaign.split('_')[1];
    if (quiz) this.mailgunTags.quiz_id = quiz.split('_')[1];
  }

  private getTypeTag(tag: string): void {
    const [, type] = tag.split('_');
    this.mailgunTags.type = type;
  }

  private getNotificationTag(tag: string): void {
    this.mailgunTags.reason = tag;
  }

  private getTagTypeFormat(tag: string): MailgunTagTypeFormats {
    if (this.isBatchTag(tag)) {
      return MailgunTagTypeFormats.BATCH;
    } else if (this.isCampaignIdTag(tag)) {
      return MailgunTagTypeFormats.CAMPAIGN;
    } else if (this.isRecontactTag(tag)) {
      return MailgunTagTypeFormats.RECONTACT;
    } else if (this.isTypeTag(tag)) {
      return MailgunTagTypeFormats.TYPE;
    } else if (this.isNotificationTag(tag)) {
      return MailgunTagTypeFormats.NOTIFICATION;
    }
    return MailgunTagTypeFormats.UNDEFINED;
  }

  private isBatchTag(tag: string): boolean {
    return tag.includes('batch_');
  }

  private isCampaignIdTag(tag: string): boolean {
    const campaignIdRegex = new RegExp('^[a-z-0-9]{24}$');
    return campaignIdRegex.test(tag);
  }

  private isRecontactTag(tag: string): boolean {
    const campaignIdRegex = new RegExp(/([a-z]{2,15})([_:])(.+)/gi);
    return campaignIdRegex.test(tag) && tag.includes('innovation_');
  }

  private isTypeTag(tag: string): boolean {
    return tag.includes('type_');
  }

  private isNotificationTag(tag: string): boolean {
    return tag.includes('notif_');
  }
}
