import { MailgunClientInfo, MailgunGeolocation, MailgunMessage, MailgunSharedEventData } from './mailgun.model';

export type MailgunClickedEventdata = MailgunSharedEventData & {
  url: string;
  message: MailgunMessage;
  'recipient-domain': string;
  ip: string;
  geolocation: MailgunGeolocation;
  'client-info': MailgunClientInfo;
};
