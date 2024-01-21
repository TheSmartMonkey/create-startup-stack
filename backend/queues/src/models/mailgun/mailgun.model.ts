import { Errors } from '@libs/utils/errors';
import { MailgunClickedEventdata } from './mailgun-clicked.model';
import { MailgunDeliveryEventdata } from './mailgun-delivered.model';
import { MailgunEventEnum } from './mailgun-events.model';
import { MailgunOpenedEventdata } from './mailgun-opened.model';
import { MailgunPermanentFailureEventData } from './mailgun-permanent-failure';
import { MailgunSpamEventData } from './mailgun-spam';
import { MailgunTemporaryFailureEventData } from './mailgun-temporary-failure';
import { MailgunUnsubscribedEventData } from './mailgun-unsubscribed';

export type Mailgun = {
  signature: MailgunSignature;
  'event-data': MailgunEventData;
};

export type MailgunEventData =
  | MailgunClickedEventdata
  | MailgunOpenedEventdata
  | MailgunDeliveryEventdata
  | MailgunSpamEventData
  | MailgunUnsubscribedEventData
  | MailgunTemporaryFailureEventData
  | MailgunPermanentFailureEventData;

export type MailgunDLQ = Mailgun & {
  dlqError: {
    dlqName: string;
    errorCode: Errors;
    error: any;
  };
};

export type MailgunSharedEventData = {
  id: string;
  timestamp: number;
  'log-level': string;
  event: MailgunEventEnum;
  recipient: string;
  campaigns: any[];
  tags: string[];
  batch?: { id: string };
  'user-variables': Record<string, string>;
};

export type MailgunSignature = {
  token: string;
  timestamp: string;
  signature: string;
};

export type MailgunMessage = {
  headers: {
    'message-id': string;
  };
};

export type MailgunClientInfo = {
  'client-os': string;
  'device-type': string;
  'client-name': string;
  'client-type': string;
  'user-agent': string;
};

export type MailgunFlags = {
  'is-routed'?: boolean;
  'is-authenticated'?: boolean;
  'is-big'?: boolean;
  'is-delayed-bounce'?: boolean;
  'is-system-test'?: boolean;
  'is-test-mode'?: boolean;
};

export type MailgunGeolocation = {
  country: string;
  region: string;
  city: string;
};

export type MailgunStorage = {
  url: string;
  key: string;
};
