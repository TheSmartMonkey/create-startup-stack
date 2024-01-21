import { MailgunFlags, MailgunMessage, MailgunSharedEventData, MailgunStorage } from './mailgun.model';

export type MailgunTemporaryFailureEventData = MailgunSharedEventData & {
  reason: string;
  severity: string;
  'delivery-status': DeliveryStatus;
  flags: MailgunFlags;
  envelope: Envelope;
  message: Message;
  'recipient-domain': string;
  storage: MailgunStorage;
};

type DeliveryStatus = {
  'attempt-no': number;
  'certificate-verified': boolean;
  code: number;
  description: string;
  'enhanced-code': string;
  message: string;
  'mx-host': string;
  'retry-seconds': number;
  'session-seconds': number;
  tls: boolean;
  utf8: boolean;
};

type Envelope = {
  sender: string;
  transport: string;
  targets: string;
  'sending-ip': string;
};

type Message = MailgunMessage & {
  attachments: any[];
  size: number;
};
