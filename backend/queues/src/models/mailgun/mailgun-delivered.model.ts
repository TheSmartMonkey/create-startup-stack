import { MailgunFlags, MailgunMessage, MailgunSharedEventData, MailgunStorage } from './mailgun.model';

export type MailgunDeliveryEventdata = MailgunSharedEventData & {
  'delivery-status': Deliverystatus;
  flags: MailgunFlags;
  envelope: Envelope;
  message: Message;
  'recipient-domain': string;
  storage: MailgunStorage;
};

type Message = MailgunMessage & {
  attachments: unknown[];
  size: number;
};

type Envelope = {
  transport: string;
  sender: string;
  'sending-ip': string;
  targets: string;
};

type Deliverystatus = {
  tls: boolean;
  'mx-host': string;
  code: number;
  description: string;
  'session-seconds': number;
  utf8: boolean;
  'attempt-no': number;
  message: string;
  'certificate-verified': boolean;
};
