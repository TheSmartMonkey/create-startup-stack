/**
 * @group integration
 */
import { describe, expect, test } from '@jest/globals';
import { MongooseAdapter } from '@libs/adapter/mongoose.adapter';
import { Fake, TEST_EMAIL_2 } from '@libs/tests/fake';
import { Generate } from '@libs/tests/generate';
import { initIntegrationTests } from '@libs/tests/init-integration';
import { cleanupIntegrationTestsDropMongoDbCollections } from '@libs/tests/utils';
import { MODELS } from '@models/api.model';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { Mailgun } from '@models/mailgun/mailgun.model';
import { Context } from 'aws-lambda';
import { WebhookDuplicatesDb } from './webhook-duplicates.db';

jest.setTimeout(20000);

describe('WebhookDupliatesDb integration', () => {
  beforeAll(async () => {
    initIntegrationTests();
    await MongooseAdapter.connect();
  });

  afterAll(async () => {
    await cleanupIntegrationTestsDropMongoDbCollections();
    await MongooseAdapter.disconnect();
  });

  beforeEach(async () => {
    await MODELS.WebhookDuplicates.deleteMany({});
  });

  test('Should insert 2 mailgunEvents in duplicates', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });
    const message2 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.SPAM_COMPLAINTS, recipient: TEST_EMAIL_2 },
    });
    const webhookDuplicate1 = new Fake().webhookDuplicate({ event: MailgunEventEnum.UNSUBSCRIBES });
    const webhookDuplicate2 = new Fake().webhookDuplicate({ event: MailgunEventEnum.SPAM_COMPLAINTS, email: TEST_EMAIL_2 });

    // When
    await new WebhookDuplicatesDb().insertManyOrUpdateManyCountWhenExist([], [webhookDuplicate1, webhookDuplicate2]);
    const scanDuplicates = await MODELS.WebhookDuplicates.find();

    // Then
    expect(scanDuplicates).toHaveLength(2);
    expect(scanDuplicates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: message1['event-data'].recipient, countRetries: 1 }),
        expect.objectContaining({ email: message2['event-data'].recipient, countRetries: 1 }),
      ]),
    );
  });

  test('Should insert 1 mailgunEvents and increment 1 in duplicates', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });
    const message2 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.SPAM_COMPLAINTS, recipient: TEST_EMAIL_2 },
    });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];
    await new Generate().createWebhookDuplicate({ sqsMessageId: records[0].messageId });

    const webhookDuplicate1 = new Fake().webhookDuplicate({ sqsMessageId: records[0].messageId, event: MailgunEventEnum.UNSUBSCRIBES });
    const webhookDuplicate2 = new Fake().webhookDuplicate({ event: MailgunEventEnum.SPAM_COMPLAINTS, email: TEST_EMAIL_2 });

    // When
    await new WebhookDuplicatesDb().insertManyOrUpdateManyCountWhenExist([webhookDuplicate1], [webhookDuplicate2]);
    const scanDuplicates = await MODELS.WebhookDuplicates.find();

    // Then
    expect(scanDuplicates).toHaveLength(2);
    expect(scanDuplicates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: message1['event-data'].recipient, countRetries: 2 }),
        expect.objectContaining({ email: message2['event-data'].recipient, countRetries: 1 }),
      ]),
    );
  });

  test('Should insert 1 mailgunEvents and increment 1 in duplicates when we have 2 different calls', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });
    const message2 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.SPAM_COMPLAINTS, recipient: TEST_EMAIL_2 },
    });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];

    const webhookDuplicate1 = new Fake().webhookDuplicate({ sqsMessageId: records[0].messageId, event: MailgunEventEnum.UNSUBSCRIBES });
    const webhookDuplicate2 = new Fake().webhookDuplicate({ event: MailgunEventEnum.SPAM_COMPLAINTS, email: TEST_EMAIL_2 });

    // When
    await new WebhookDuplicatesDb().insertManyOrUpdateManyCountWhenExist([], [webhookDuplicate1, webhookDuplicate2]);
    await new WebhookDuplicatesDb().insertManyOrUpdateManyCountWhenExist([webhookDuplicate1], []);
    const scanDuplicates = await MODELS.WebhookDuplicates.find();

    // Then
    expect(scanDuplicates).toHaveLength(2);
    expect(scanDuplicates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: message1['event-data'].recipient, countRetries: 2 }),
        expect.objectContaining({ email: message2['event-data'].recipient, countRetries: 1 }),
      ]),
    );
  });

  test('Should insert 2 mailgunEvents and increment 1 in duplicates when mail and eventType are the same', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.DELIVERED_MESSAGE } });
    const message2 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.OPENS } });
    const message3 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });

    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2), Fake.sqsRecord(message3)];
    await MODELS.WebhookDuplicates.create(
      new Fake().webhookDuplicate({ sqsMessageId: records[0].messageId, event: message1['event-data'].event }),
    );
    const webhookDuplicate1 = new Fake().webhookDuplicate({ sqsMessageId: records[0].messageId, event: message1['event-data'].event });
    const webhookDuplicate2 = new Fake().webhookDuplicate({ sqsMessageId: records[1].messageId, event: message2['event-data'].event });
    const webhookDuplicate3 = new Fake().webhookDuplicate({ sqsMessageId: records[2].messageId, event: message3['event-data'].event });

    // When
    await new WebhookDuplicatesDb().insertManyOrUpdateManyCountWhenExist([webhookDuplicate1], [webhookDuplicate2, webhookDuplicate3]);
    const scanDuplicates = await MODELS.WebhookDuplicates.find();

    // Then
    expect(scanDuplicates).toHaveLength(3);
    expect(scanDuplicates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: message1['event-data'].recipient, event: message1['event-data'].event, countRetries: 2 }),
        expect.objectContaining({ email: message2['event-data'].recipient, event: message2['event-data'].event, countRetries: 1 }),
        expect.objectContaining({ email: message3['event-data'].recipient, event: message3['event-data'].event, countRetries: 1 }),
      ]),
    );
  });

  test('Should insert 2 mailgunEvents when headers are missing', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({});
    const message2: Mailgun = {
      signature: {
        token: 'd9ef7f5c9dfdb13ec19ac847a198074d328ee64a488013b8fd',
        timestamp: '1681886706',
        signature: 'dd841365591073575108130319ce42e1739d7104ce88d3acbd238215b66edfd2',
      },
      'event-data': {
        event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE,
        id: 'yY_s08N6RBqdw1-9XB-iBg',
        timestamp: 1681886706.9759276,
        envelope: {},
        message: {
          headers: {},
          size: 5158,
        },
        flags: {
          'is-delayed-bounce': true,
        },
        recipient: '1483@midasfrance.net',
        'recipient-domain': '',
        method: '',
        tags: [],
        campaigns: [],
        'delivery-status': {
          code: 550,
          'bounce-code': '5.0.0',
          message:
            "smtp; The email account that you tried to reach does not exist. Please try double-checking the recipient's email address for typos or unnecessary spaces. Learn more at https://support.google.com/mail/answer/6596",
        },
        severity: 'permanent',
        reason: 'generic',
      },
    } as unknown as Mailgun;
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];

    // When
    const response = new WebhookDuplicatesDb().mailgunEventsToDao([message1, message2], records, {
      functionName: 'fakeFunctionName',
    } as Context);
    const webhookDuplicate1 = new Fake().webhookDuplicate({ ...response[0] });
    const webhookDuplicate2 = new Fake().webhookDuplicate({ ...response[1] });
    await new WebhookDuplicatesDb().insertManyOrUpdateManyCountWhenExist([], [webhookDuplicate1, webhookDuplicate2]);
    const scanDuplicates = await MODELS.WebhookDuplicates.find();

    // Then
    expect(scanDuplicates).toHaveLength(2);
    expect(scanDuplicates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: message1['event-data'].recipient,
          event: message1['event-data'].event,
          countRetries: 1,
          mailgunMessageId: message1['event-data'].message.headers['message-id'],
        }),
        expect.objectContaining({
          email: message2['event-data'].recipient,
          event: message2['event-data'].event,
          countRetries: 1,
          mailgunMessageId: 'unknown',
        }),
      ]),
    );
  });
});
