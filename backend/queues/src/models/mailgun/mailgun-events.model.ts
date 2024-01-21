export enum MailgunEventEnum {
  CLICKED = 'clicked',
  SPAM_COMPLAINTS = 'complained',
  DELIVERED_MESSAGE = 'delivered',
  OPENS = 'opened',
  PERMANENT_OR_TEMPORARY_FAILURE = 'failed', // Most are bounce events
  UNSUBSCRIBES = 'unsubscribed',
}

export enum MailgunEntityEnum {
  PRO = 'pro',
  BLACKLIST = 'blacklist',
  BOUNCED = 'bounced',
  ALL = 'all',
  UNSUBSCRIBE = 'unsubscribe',
}

export const mailgunEventsByEntity = {
  [MailgunEntityEnum.PRO]: [MailgunEventEnum.CLICKED, MailgunEventEnum.OPENS],
  [MailgunEntityEnum.BLACKLIST]: [
    MailgunEventEnum.SPAM_COMPLAINTS,
    MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE,
    MailgunEventEnum.UNSUBSCRIBES,
  ],
  [MailgunEntityEnum.UNSUBSCRIBE]: [MailgunEventEnum.UNSUBSCRIBES],
  [MailgunEntityEnum.BOUNCED]: [MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE],
  [MailgunEntityEnum.ALL]: Object.values(MailgunEventEnum),
};
