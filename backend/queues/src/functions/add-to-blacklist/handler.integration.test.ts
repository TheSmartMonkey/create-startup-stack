/**
 * @group integration
 */
import { describe, expect, test } from '@jest/globals';
import { MongoDbAdapter } from '@libs/adapter/mongodb.adapter';
import { MongooseAdapter } from '@libs/adapter/mongoose.adapter';
import { Fake, TEST_EMAIL, TEST_EMAIL_2 } from '@libs/tests/fake';
import { Generate } from '@libs/tests/generate';
import { initIntegrationTests } from '@libs/tests/init-integration';
import { executeLambdaSQS, generateValidatedSQSEvent } from '@libs/tests/mocks';
import { cleanupIntegrationTestsDropMongoDbCollections, getPro } from '@libs/tests/utils';
import { SqsUtils } from '@libs/utils/sqs';
import { Utils } from '@libs/utils/utils';
import { MODELS } from '@models/api.model';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { main } from './handler';

jest.setTimeout(50000);

describe('addToBlacklist integration', () => {
  let sendFailedEventsToDLQSpy: jest.SpyInstance;

  beforeAll(async () => {
    initIntegrationTests();
    await MongooseAdapter.connect();
    await MongoDbAdapter.connect();
  });

  afterAll(async () => {
    await cleanupIntegrationTestsDropMongoDbCollections();
    await MongooseAdapter.disconnect();
    await MongoDbAdapter.disconnect();
  });

  beforeEach(async () => {
    await new Generate().deleteAllpros();
    await new Generate().createPro();
    await new Generate().createPro({ email: TEST_EMAIL_2 });
    await MODELS.Blacklist.deleteMany({});
    await MODELS.WebhookDuplicates.deleteMany({});
    sendFailedEventsToDLQSpy = jest.spyOn(SqsUtils.prototype, 'sendFailedEventsToDLQ').mockImplementation(() => Promise.resolve());
  });

  test('Should insert 2 mailgunEvents to blacklist', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });
    const message2 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.SPAM_COMPLAINTS, recipient: TEST_EMAIL_2 },
    });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);
    const scanBlacklist = await MODELS.Blacklist.find();

    // Then
    expect(scanBlacklist).toHaveLength(2);
    expect(scanBlacklist).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: message1['event-data'].recipient }),
        expect.objectContaining({ email: message2['event-data'].recipient }),
      ]),
    );
    expect(sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual([]);
  });

  test('Should insert 2 mailgunEvents to duplicates', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });
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

  test('Should insert only 1 mailgunEvents to blacklist when email already exist', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });
    const message2 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.SPAM_COMPLAINTS, recipient: TEST_EMAIL_2 },
    });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];
    await new Generate().createBlacklist();

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);
    const scanBlacklist = await MODELS.Blacklist.find();
    const scanDuplicates = await MODELS.WebhookDuplicates.find();

    // Then
    expect(scanBlacklist).toHaveLength(2);
    expect(scanBlacklist).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: message1['event-data'].recipient }),
        expect.objectContaining({ email: message2['event-data'].recipient }),
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

  test('Should pro email confidence be set to 0', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });
    const records = [Fake.sqsRecord(message1)];
    await new Generate().updateProEmailConfidence(TEST_EMAIL, { emailConfidence: 100 });
    const proBefore = await getPro(TEST_EMAIL);

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);
    const proAfter = await getPro(TEST_EMAIL);

    // Then
    expect(proBefore.emailConfidence).toEqual(100);
    expect(proAfter.emailConfidence).toEqual(0);
    expect(sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual([]);
  });

  test('Should not send events to DLQ when sqsMessageId already exists', async () => {
    // Given
    const messageId = Utils.generateUUID();
    const message1 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.UNSUBSCRIBES },
    });
    const records = [Fake.sqsRecord(message1, { messageId }), Fake.sqsRecord(message1, { messageId })];
    await new Generate().createWebhookDuplicate({ sqsMessageId: messageId });

    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);
    const scanBlacklist = await MODELS.Blacklist.find();

    // Then
    expect(scanBlacklist).toHaveLength(1);
    expect(scanBlacklist).toEqual(expect.arrayContaining([expect.objectContaining({ email: message1['event-data'].recipient })]));
    expect(sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual([]);
  });

  test('Should not send events to DLQ when email already exists but sqsMessageId is different', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.UNSUBSCRIBES },
    });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message1)];
    await new Generate().createWebhookDuplicate();

    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);
    const scanBlacklist = await MODELS.Blacklist.find();

    // Then
    expect(scanBlacklist).toHaveLength(1);
    expect(scanBlacklist).toEqual(expect.arrayContaining([expect.objectContaining({ email: message1['event-data'].recipient })]));
    expect(sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual([]);
  });
});
