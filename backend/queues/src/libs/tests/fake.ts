import { Errors } from '@libs/utils/errors';
import { Utils } from '@libs/utils/utils';
import { MailgunClickedEventdata } from '@models/mailgun/mailgun-clicked.model';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { Mailgun, MailgunDLQ, MailgunEventData, MailgunSignature } from '@models/mailgun/mailgun.model';
import { Blacklist, BlacklistReason } from '@models/mongoose/blacklist.model';
import { Bounced } from '@models/mongoose/bounced.model';
import { MailEvent } from '@models/mongoose/mail-events.model';
import { WebhookDuplicates } from '@models/mongoose/webhook-duplicates.model';
import { MailingServices } from '@models/services.model';
import { SQSRecord } from 'aws-lambda';
import { MailService } from '@models/mongoose/mail-services.model';

export const TEST_EMAIL = 'laurent@umi.com';
export const TEST_EMAIL_2 = 'laurent2@umi.com';

export class Fake {
  static sqsRecord(message: Mailgun, partial?: Partial<SQSRecord>): SQSRecord {
    return {
      messageId: Utils.generateUUID(),
      receiptHandle: '',
      body: JSON.stringify({
        Message: JSON.stringify(message),
      }),
      attributes: {
        ApproximateReceiveCount: '',
        SentTimestamp: '',
        SenderId: '',
        ApproximateFirstReceiveTimestamp: '',
      },
      messageAttributes: {},
      md5OfBody: '',
      eventSource: '',
      eventSourceARN: '',
      awsRegion: '',
      ...partial,
    };
  }

  mailService(innovationId: string, messageId: string, tagType = 'type_recontact'): MailService {
    return {
      messageId: messageId,
      tags: [tagType, `innovation_${innovationId}&campaign_62c45a8740ecb76ab4eee8b2&quiz_62c45a8740ecb76ab4eee8b2`],
    } as MailService;
  }

  mailgunEvent({
    signature,
    eventData,
    messageId,
  }: {
    signature?: Partial<MailgunSignature>;
    eventData?: Partial<MailgunEventData>;
    messageId?: string;
  }): Mailgun {
    messageId = messageId ? messageId : '20130503182626.18666.16540@sandboxf8804cecd4ad4dd599ec8f3f48d91c33.mailgun.org';
    return {
      signature: this.valideSignature(signature),
      'event-data': {
        id: Utils.generateUUID(),
        timestamp: 1234,
        'log-level': 'debug',
        event: MailgunEventEnum.CLICKED,
        message: {
          headers: {
            'message-id': messageId,
          },
        },
        recipient: TEST_EMAIL,
        'recipient-domain': '',
        campaigns: [],
        tags: ['62c45a8740ecb76ab4eee8b2', 'batch_63cfeb6f32c7f36c06038899_2', 'campaign'],
        'user-variables': {},
        ...eventData,
      } as MailgunEventData,
    };
  }

  dlqMailgunEvent({
    errorCode,
    signature,
    eventData,
  }: {
    errorCode?: Errors;
    signature?: Partial<MailgunSignature>;
    eventData?: Partial<MailgunEventData>;
  }): MailgunDLQ {
    return {
      ...this.mailgunEvent({ signature, eventData }),
      dlqError: {
        dlqName: Errors.ENV_VARIABLE_DLQ_NAME_UNDEFINED,
        error: new Error('Error'),
        errorCode: errorCode ?? Errors.UNKNOWN_ERROR,
      },
    };
  }

  valideSignature(partial?: Partial<MailgunSignature>): MailgunSignature {
    return {
      token: '7ec4fbbf253627e9df4d5d658404b89fd5c5e6560fae5455a8',
      timestamp: '1678093504',
      signature: '69beba65310c3dd3d2029b3e80499b855931fd744c053be4ed5bbe628c7e6670',
      ...partial,
    };
  }

  invalideSignature(partial?: Partial<MailgunSignature>): MailgunSignature {
    return { signature: '', token: '', timestamp: '', ...partial };
  }

  webhookDuplicate(partial?: Partial<WebhookDuplicates>): WebhookDuplicates {
    return {
      sqsMessageId: Utils.generateUUID(),
      event: MailgunEventEnum.CLICKED,
      email: TEST_EMAIL,
      mailgunMessageId: '20130503182626.18666.16540@sandboxf8804cecd4ad4dd599ec8f3f48d91c33.mai…',
      source: 'unknown',
      countRetries: 1,
      ...partial,
    };
  }

  pro(partial?: any): any {
    return {
      ambassador: {
        is: null,
        positionLevel: 'uncategorized',
        persona: '',
        industry: '',
        experience: 'uncategorized',
        ambassadorStatus: 'uncategorized',
        ambassadorCommitment: [],
        qualification: { $numberInt: '1' },
        qualificationWhy: '',
        ambassadorSource: 'unknown',
        notes: '',
        motivations: { $numberInt: '0' },
        activity: { $numberInt: '0' },
        ambassadorTags: [],
        quality: { $numberInt: '0' },
      },
      lastContact: { innovation: '', date: { $date: { $numberLong: '1641368878723' } } },
      innovations: [],
      campaign: '',
      quiz: '',
      recontacting: '',
      campaigns: [],
      user: { $oid: '61d54dbde43ae683d4cd6d52' },
      anonymous: false,
      language: 'en',
      telephone: ['', null, null],
      tags: [],
      oldDbId: '',
      firstName: 'Laurent',
      lastName: 'VANDELLE',
      jobs: [],
      emailConfidence: 80,
      profileUrl: '',
      keywords: [],
      request: '',
      batches: [],
      pseudonymized: false,
      expirationDate: { $date: { $numberLong: '1735976878723' } },
      email: TEST_EMAIL,
      jobTitle: 'dev',
      country: 'FR',
      company: { $oid: '61d54dbde43ae683d4cd6d53' },
      created: { $date: { $numberLong: '1641369021449' } },
      updated: { $date: { $numberLong: '1678363200993' } },
      ...partial,
    };
  }

  mailEvent(partial?: Partial<MailEvent>): MailEvent {
    const batchId = Utils.generateUUID();
    const campaignId = Utils.generateUUID();
    return {
      event: MailgunEventEnum.CLICKED,
      service: MailingServices.MAILGUN,
      messageId: '20130503182626.18666.16540@sandboxf8804cecd4ad4dd599ec8f3f48d91c33.mai…',
      recipient: TEST_EMAIL,
      metadata: { campaign_id: campaignId, batch_id: batchId },
      campaign: campaignId,
      batch: batchId,
      step: 2,
      ...partial,
    };
  }

  blacklist(partial?: Partial<Blacklist>): Blacklist {
    return {
      email: TEST_EMAIL,
      altEmail: TEST_EMAIL,
      domain: TEST_EMAIL.split('@')[1],
      reason: BlacklistReason.MANUALLY_ADDED,
      ...partial,
    };
  }

  bounced(partial?: Partial<Bounced>): Bounced {
    return {
      email: TEST_EMAIL,
      domain: TEST_EMAIL.split('@')[1],
      ...partial,
    };
  }

  mailgunClickedEventdata(url: string): MailgunClickedEventdata {
    return {
      'log-level': '',
      'user-variables': {},
      campaigns: [],
      event: MailgunEventEnum.CLICKED,
      id: '',
      recipient: '',
      tags: [],
      timestamp: 0,
      url: url,
      message: {
        headers: { 'message-id': 'test url clique' },
      },
      'recipient-domain': 'test@test.com',
      ip: '12345x',
      geolocation: {
        country: 'France',
        region: 'Rhone',
        city: 'Lyon',
      },
      'client-info': {
        'client-os': '',
        'device-type': '',
        'client-name': '',
        'client-type': '',
        'user-agent': '',
      },
    };
  }
}
