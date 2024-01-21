import { MailgunFlags, MailgunSharedEventData, MailgunStorage } from './mailgun.model';

export type MailgunPermanentFailureEventData = MailgunSharedEventData & {
  severity: string;
  reason: string;
  'delivery-status': DeliveryStatus;
  flags: MailgunFlags;
  envelope: Envelope;
  message: Message;
  'recipient-domain': string;
  storage: MailgunStorage;
};

type DeliveryStatus = {
  'attempt-no': number;
  message: string;
  code: number;
  'enhanced-code': string;
  description: string;
  'session-seconds': number;
  'bounce-code'?: string;
};

type Envelope = {
  sender: string;
  transport: string;
  targets: string;
  'sending-ip'?: string;
};

type Message = {
  headers: Headers;
  attachments: any[];
  size: number;
};

type Headers = {
  to: string;
  'message-id': string;
  from: string;
  subject: string;
};
