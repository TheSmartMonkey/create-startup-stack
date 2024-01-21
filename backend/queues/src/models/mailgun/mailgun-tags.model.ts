export enum MailgunTagTypeFormats {
  BATCH = 'batch_{batchId}_{step}',
  CAMPAIGN = '{campaignId}',
  RECONTACT = 'innovation_{innocationId}&campaign_{campaignId}&quiz_{quizId}',
  TYPE = 'type_{type}',
  NOTIFICATION = 'notif_{notification}',
  UNDEFINED = 'undefined',
}

export type MailgunTags = {
  innovation_id?: string;
  campaign_id?: string;
  batch_id?: string;
  quiz_id?: string;
  type?: string;
  step?: number;
  reason?: string;
};
