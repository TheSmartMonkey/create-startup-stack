import { MailgunClientInfo, MailgunGeolocation, MailgunMessage, MailgunSharedEventData } from './mailgun.model';

export type MailgunUnsubscribedEventData = MailgunSharedEventData & {
  message: MailgunMessage;
  'recipient-domain': string;
  ip: string;
  geolocation: MailgunGeolocation;
  'client-info': MailgunClientInfo;
};
