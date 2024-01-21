/**
 * @group integration
 */
import { describe, expect, test } from '@jest/globals';
import { MongooseAdapter } from '@libs/adapter/mongoose.adapter';
import { Fake, TEST_EMAIL_2 } from '@libs/tests/fake';
import { Generate } from '@libs/tests/generate';
import { initIntegrationTests } from '@libs/tests/init-integration';
import { executeLambdaSQS, generateValidatedSQSEvent } from '@libs/tests/mocks';
import { cleanupIntegrationTestsDropMongoDbCollections } from '@libs/tests/utils';
import { SqsUtils } from '@libs/utils/sqs';
import { Utils } from '@libs/utils/utils';
import { MODELS } from '@models/api.model';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { main } from './handler';

jest.setTimeout(20000);

describe('addToMailEvents integration', () => {
  let sendFailedEventsToDLQSpy: jest.SpyInstance;

  beforeAll(async () => {
    initIntegrationTests();
    await MongooseAdapter.connect();
  });

  afterAll(async () => {
    await cleanupIntegrationTestsDropMongoDbCollections();
    await MongooseAdapter.disconnect();
  });

  beforeEach(async () => {
    await MODELS.MailEvent.deleteMany({});
    await MODELS.WebhookDuplicates.deleteMany({});
    sendFailedEventsToDLQSpy = jest.spyOn(SqsUtils.prototype, 'sendFailedEventsToDLQ').mockImplementation(() => Promise.resolve());
  });

  test('Should insert 2 mailgunEvents to MailEvent and duplicates', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.DELIVERED_MESSAGE } });
    const message2 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.SPAM_COMPLAINTS, recipient: TEST_EMAIL_2 },
    });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);
    const scanMailEvent = await MODELS.MailEvent.find();
    const scanDuplicates = await MODELS.WebhookDuplicates.find();

    // Then
    expect(scanMailEvent).toHaveLength(2);
    expect(scanMailEvent).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ recipient: message1['event-data'].recipient }),
        expect.objectContaining({ recipient: message2['event-data'].recipient }),
      ]),
    );
    expect(scanDuplicates).toHaveLength(2);
    expect(scanDuplicates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ event: message1['event-data'].event, email: message1['event-data'].recipient, countRetries: 1 }),
        expect.objectContaining({ event: message2['event-data'].event, email: message2['event-data'].recipient, countRetries: 1 }),
      ]),
    );
    expect(sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual([]);
  });

  test('Should insert 2 mailgunEvents to duplicates', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.DELIVERED_MESSAGE } });
    const message2 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.SPAM_COMPLAINTS, recipient: TEST_EMAIL_2 },
    });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);
    const scanDuplicates = await MODELS.WebhookDuplicates.find();

    // Then
    expect(scanDuplicates).toHaveLength(2);
    expect(scanDuplicates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ event: message1['event-data'].event, email: message1['event-data'].recipient, countRetries: 1 }),
        expect.objectContaining({ event: message2['event-data'].event, email: message2['event-data'].recipient, countRetries: 1 }),
      ]),
    );
    expect(sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual([]);
  });

  test('Should insert 2 mailgunEvents to MailEvent with clicked event with an url', async () => {
    // Given
    const url = 'https://umi-innovation.com';
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.CLICKED, url } });
    const message2 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.SPAM_COMPLAINTS, recipient: TEST_EMAIL_2 },
    });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);
    const scanMailEvent = await MODELS.MailEvent.find();

    // Then
    expect(scanMailEvent).toHaveLength(2);
    expect(scanMailEvent).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ recipient: message1['event-data'].recipient, metadata: expect.objectContaining({ url }) }),
        expect.objectContaining({ recipient: message2['event-data'].recipient }),
      ]),
    );
    expect(sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual([]);
  });

  test('Should insert 1 mailgunEvents to MailEvent and 1 duplicate with count=1', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.DELIVERED_MESSAGE } });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message1)];

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);
    const scanMailEvent = await MODELS.MailEvent.find();
    const scanDuplicates = await MODELS.WebhookDuplicates.find();

    // Then
    expect(scanMailEvent).toHaveLength(1);
    expect(scanMailEvent).toEqual(expect.arrayContaining([expect.objectContaining({ recipient: message1['event-data'].recipient })]));
    expect(scanDuplicates).toHaveLength(1);
    expect(scanDuplicates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ event: message1['event-data'].event, email: message1['event-data'].recipient, countRetries: 1 }),
      ]),
    );
    expect(sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual([]);
  });

  test('Should keep 1 unique event when there are duplicated in the event batch', async () => {
    // Given
    const email = 'laurent3@umi.com';
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.CLICKED } });
    const message2 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.OPENS } });
    const message3 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.OPENS } });
    const message4 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });
    const message5 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.CLICKED, recipient: TEST_EMAIL_2 } });
    const message6 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.OPENS, recipient: TEST_EMAIL_2 } });
    const message7 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.OPENS, recipient: TEST_EMAIL_2 } });
    const message8 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES, recipient: TEST_EMAIL_2 } });
    const message9 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE, recipient: email } });
    const records = [
      Fake.sqsRecord(message1),
      Fake.sqsRecord(message2),
      Fake.sqsRecord(message3),
      Fake.sqsRecord(message4),
      Fake.sqsRecord(message5),
      Fake.sqsRecord(message6),
      Fake.sqsRecord(message7),
      Fake.sqsRecord(message8),
      Fake.sqsRecord(message9),
    ];

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);
    const scanMailEvent = await MODELS.MailEvent.find();
    const scanDuplicates = await MODELS.WebhookDuplicates.find();

    // Then
    expect(scanMailEvent).toHaveLength(7);
    expect(scanMailEvent).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ recipient: message1['event-data'].recipient, event: message1['event-data'].event }),
        expect.objectContaining({ recipient: message2['event-data'].recipient, event: message2['event-data'].event }),
        expect.objectContaining({ recipient: message4['event-data'].recipient, event: message4['event-data'].event }),
        expect.objectContaining({ recipient: message5['event-data'].recipient, event: message5['event-data'].event }),
        expect.objectContaining({ recipient: message6['event-data'].recipient, event: message6['event-data'].event }),
        expect.objectContaining({ recipient: message8['event-data'].recipient, event: message8['event-data'].event }),
        expect.objectContaining({ recipient: message9['event-data'].recipient, event: message9['event-data'].event }),
      ]),
    );
    expect(scanDuplicates).toHaveLength(7);
    expect(scanDuplicates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: message1['event-data'].recipient, event: message1['event-data'].event }),
        expect.objectContaining({ email: message2['event-data'].recipient, event: message2['event-data'].event }),
        expect.objectContaining({ email: message4['event-data'].recipient, event: message4['event-data'].event }),
        expect.objectContaining({ email: message5['event-data'].recipient, event: message5['event-data'].event }),
        expect.objectContaining({ email: message6['event-data'].recipient, event: message6['event-data'].event }),
        expect.objectContaining({ email: message8['event-data'].recipient, event: message8['event-data'].event }),
        expect.objectContaining({ email: message9['event-data'].recipient, event: message9['event-data'].event }),
      ]),
    );
    expect(sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual([]);
  });

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Should insert 2 mailgunEvents when there is a duplicate of sqsMessageId in duplicate db', async () => {
    // Given
    const sqsMessageId = Utils.generateUUID();
    const message1 = new Fake().mailgunEvent({});
    const message2 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.OPENS } });
    const message3 = new Fake().mailgunEvent({ eventData: { recipient: TEST_EMAIL_2 } });
    const records = [Fake.sqsRecord(message1, { messageId: sqsMessageId }), Fake.sqsRecord(message2), Fake.sqsRecord(message3)];
    await new Generate().createMailEvent();
    await new Generate().createWebhookDuplicate({ sqsMessageId });

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);
    const scanMailEvent = await MODELS.MailEvent.find();
    const scanDuplicates = await MODELS.WebhookDuplicates.find();

    // Then
    expect(scanMailEvent).toHaveLength(3);
    expect(scanMailEvent).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ recipient: message1['event-data'].recipient, event: message1['event-data'].event }),
        expect.objectContaining({ recipient: message2['event-data'].recipient, event: message2['event-data'].event }),
        expect.objectContaining({ recipient: message3['event-data'].recipient, event: message3['event-data'].event }),
      ]),
    );
    expect(scanDuplicates).toHaveLength(3);
    expect(scanDuplicates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sqsMessageId, countRetries: 2 }),
        expect.objectContaining({ event: message2['event-data'].event, email: message2['event-data'].recipient, countRetries: 1 }),
        expect.objectContaining({ event: message3['event-data'].event, email: message3['event-data'].recipient, countRetries: 1 }),
      ]),
    );
    expect(sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual([]);
  });

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Should insert 2 mailgunEvents when there is a duplicate of email / event in mailevent db', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({});
    const message2 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.OPENS } });
    const message3 = new Fake().mailgunEvent({ eventData: { recipient: TEST_EMAIL_2 } });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2), Fake.sqsRecord(message3)];
    await new Generate().createMailEvent({});

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);
    const scanMailEvent = await MODELS.MailEvent.find();
    const scanDuplicates = await MODELS.WebhookDuplicates.find();

    // Then
    expect(scanMailEvent).toHaveLength(3);
    expect(scanMailEvent).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ recipient: message1['event-data'].recipient, event: message1['event-data'].event }),
        expect.objectContaining({ recipient: message2['event-data'].recipient, event: message2['event-data'].event }),
        expect.objectContaining({ recipient: message3['event-data'].recipient, event: message3['event-data'].event }),
      ]),
    );
    expect(scanDuplicates).toHaveLength(3);
    expect(scanDuplicates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ event: message1['event-data'].event, email: message1['event-data'].recipient, countRetries: 1 }),
        expect.objectContaining({ event: message2['event-data'].event, email: message2['event-data'].recipient, countRetries: 1 }),
        expect.objectContaining({ event: message3['event-data'].event, email: message3['event-data'].recipient, countRetries: 1 }),
      ]),
    );
    expect(sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual([]);
  });
});
