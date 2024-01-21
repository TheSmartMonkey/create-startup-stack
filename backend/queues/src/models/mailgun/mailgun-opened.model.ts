import { MailgunClientInfo, MailgunGeolocation, MailgunMessage, MailgunSharedEventData } from './mailgun.model';

export type MailgunOpenedEventdata = MailgunSharedEventData & {
  message: MailgunMessage;
  'recipient-domain': string;
  ip: string;
  geolocation: MailgunGeolocation;
  'client-info': MailgunClientInfo;
};
