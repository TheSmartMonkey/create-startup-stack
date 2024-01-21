/**
 * @group integration
 */
import { describe, expect, test } from '@jest/globals';
import { MongooseAdapter } from '@libs/adapter/mongoose.adapter';
import { Fake, TEST_EMAIL_2 } from '@libs/tests/fake';
import { Generate } from '@libs/tests/generate';
import { executeLambdaSQS, generateValidatedSQSEvent } from '@libs/tests/mocks';
import { initIntegrationTests } from '@libs/tests/init-integration';
import { cleanupIntegrationTestsDropMongoDbCollections } from '@libs/tests/utils';
import { SqsUtils } from '@libs/utils/sqs';
import { MODELS } from '@models/api.model';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { main } from './handler';

jest.setTimeout(20000);

describe('addToBounced integration', () => {
  let sendFailedEventsToDLQSpy: jest.SpyInstance;

  beforeAll(async () => {
    initIntegrationTests();
    await MongooseAdapter.connect();
  });

  beforeEach(async () => {
    await MODELS.Bounced.deleteMany({});
    await MODELS.WebhookDuplicates.deleteMany({});
    sendFailedEventsToDLQSpy = jest.spyOn(SqsUtils.prototype, 'sendFailedEventsToDLQ').mockImplementation(() => Promise.resolve());
  });

  afterAll(async () => {
    await cleanupIntegrationTestsDropMongoDbCollections();
    await MongooseAdapter.disconnect();
  });

  test('Should insert 2 mailgunEvents to bounced and duplicates', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE } });
    const message2 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE, recipient: TEST_EMAIL_2 },
    });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);
    const scanBounced = await MODELS.Bounced.find();
    const scanDuplicates = await MODELS.WebhookDuplicates.find();

    // Then
    expect(scanBounced).toHaveLength(2);
    expect(scanBounced).toEqual(
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

  test('Should insert 1 mailgunEvents to bounced and 1 mailgunEvents in duplicates when event is in duplicates', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE } });
    const message2 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE, recipient: TEST_EMAIL_2 },
    });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];
    await new Generate().createBounced();
    await new Generate().createWebhookDuplicate({
      sqsMessageId: records[0].messageId,
      event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE,
    });

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);
    const scanBounced = await MODELS.Bounced.find();
    const scanDuplicates = await MODELS.WebhookDuplicates.find();

    // Then
    expect(scanBounced).toHaveLength(2);
    expect(scanBounced).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: message1['event-data'].recipient }),
        expect.objectContaining({ email: message2['event-data'].recipient }),
      ]),
    );
    expect(scanDuplicates).toHaveLength(2);
    expect(scanDuplicates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ event: message1['event-data'].event, email: message1['event-data'].recipient, countRetries: 2 }),
        expect.objectContaining({ event: message2['event-data'].event, email: message2['event-data'].recipient, countRetries: 1 }),
      ]),
    );
    expect(sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual([]);
  });

  test('Should insert only 1 mailgunEvents to bounced when email already exist', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE } });
    const message2 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE, recipient: TEST_EMAIL_2 },
    });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];
    await new Generate().createBounced();

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);
    const scanBounced = await MODELS.Bounced.find();
    const scanDuplicates = await MODELS.WebhookDuplicates.find();

    // Then
    expect(scanBounced).toHaveLength(2);
    expect(scanBounced).toEqual(
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

  test('Should insert one event when two identical events send', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE, recipient: 'testemaildoesnotexist@umi.com' },
    });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message1)];

    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);
    const scanBounced = await MODELS.Bounced.find();

    // Then
    expect(scanBounced).toHaveLength(1);
    expect(scanBounced).toEqual(expect.arrayContaining([expect.objectContaining({ email: message1['event-data'].recipient })]));
    expect(sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual([]);
  });
});
