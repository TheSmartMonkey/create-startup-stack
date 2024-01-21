import { MailgunMessage, MailgunSharedEventData } from './mailgun.model';

export type MailgunSpamEventData = MailgunSharedEventData & {
  envelope: Envelope;
  flags: Flags;
  message: Message;
};

type Envelope = {
  'sending-ip': string;
};

type Flags = {
  'is-test-mode': boolean;
};

type Message = MailgunMessage & {
  attachments: any[];
  size: number;
};
