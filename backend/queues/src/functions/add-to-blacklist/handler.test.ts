/**
 * @group unit
 */
import { describe, expect, test } from '@jest/globals';
import { MongoDbAdapter } from '@libs/adapter/mongodb.adapter';
import { MongooseAdapter } from '@libs/adapter/mongoose.adapter';
import { ProDb } from '@libs/db/pro/pro.db';
import { WebhookDuplicatesDb } from '@libs/db/webhook-duplicates/webhook-duplicates.db';
import { Fake, TEST_EMAIL_2 } from '@libs/tests/fake';
import { initUnitTests, InitUnitTestsSpies, initUnitTestsSpies } from '@libs/tests/init-unit';
import { executeLambdaSQS, generateValidatedSQSEvent, mockGetDuplicatesAndNoneDuplicates } from '@libs/tests/mocks';
import { MODELS } from '@models/api.model';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { main } from './handler';

describe('addToBlacklist unit', () => {
  let initSpies: InitUnitTestsSpies;
  let getDuplicatesAndNoneDuplicatesSpy: jest.SpyInstance;
  let insertManyBlacklistSpy: jest.SpyInstance;
  let updateManyEmailConfidenceSpy: jest.SpyInstance;
  let webhookDuplicatesSpy: jest.SpyInstance;

  beforeAll(() => {
    initUnitTests();
  });

  beforeEach(() => {
    initSpies = initUnitTestsSpies();
    jest.spyOn(MongooseAdapter, 'connect').mockImplementation(() => Promise.resolve());
    jest.spyOn(MongoDbAdapter, 'connect').mockImplementation(() => Promise.resolve());
    getDuplicatesAndNoneDuplicatesSpy = mockGetDuplicatesAndNoneDuplicates([], {});
    insertManyBlacklistSpy = jest.spyOn(MODELS.Blacklist, 'insertMany').mockImplementation(() => Promise.resolve());
    updateManyEmailConfidenceSpy = jest.spyOn(ProDb.prototype, 'updateManyEmailConfidence').mockImplementation(() => Promise.resolve([]));
    webhookDuplicatesSpy = jest
      .spyOn(WebhookDuplicatesDb.prototype, 'insertManyOrUpdateManyCountWhenExist')
      .mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should insert to blacklist and update pros when records are passed', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE } });
    const message2 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE, recipient: TEST_EMAIL_2 },
    });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];
    getDuplicatesAndNoneDuplicatesSpy = mockGetDuplicatesAndNoneDuplicates(records, { noneDuplicates: [message1, message2] });

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(getDuplicatesAndNoneDuplicatesSpy).toHaveBeenCalled();
    expect(insertManyBlacklistSpy).toHaveBeenCalled();
    expect(updateManyEmailConfidenceSpy).toHaveBeenCalled();
    expect(webhookDuplicatesSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy.mock.calls[0][0]).toHaveLength(0);
  });

  test('Should not insert to blacklist and not update pros when no records are passed', async () => {
    // Given
    const records = [] as any[];

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(getDuplicatesAndNoneDuplicatesSpy).not.toHaveBeenCalled();
    expect(insertManyBlacklistSpy).not.toHaveBeenCalled();
    expect(updateManyEmailConfidenceSpy).not.toHaveBeenCalled();
    expect(webhookDuplicatesSpy).not.toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy).not.toHaveBeenCalled();
  });

  test('Should insert to blacklist and update pros and send not processed message to DLQ', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE, recipient: TEST_EMAIL_2 },
    });
    const message2 = new Fake().mailgunEvent({});
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];
    getDuplicatesAndNoneDuplicatesSpy = mockGetDuplicatesAndNoneDuplicates(records, { noneDuplicates: [message1] });

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(getDuplicatesAndNoneDuplicatesSpy).toHaveBeenCalled();
    expect(insertManyBlacklistSpy).toHaveBeenCalled();
    expect(updateManyEmailConfidenceSpy).toHaveBeenCalled();
    expect(webhookDuplicatesSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy.mock.calls[0][0]).toHaveLength(0);
  });

  test('Should insert to blacklist and update pros and send not processed message to DLQ when webhook duplicates fails', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE } });
    const message2 = new Fake().mailgunEvent({});
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];
    getDuplicatesAndNoneDuplicatesSpy = mockGetDuplicatesAndNoneDuplicates(records, { noneDuplicates: [message1, message2] });
    webhookDuplicatesSpy = jest
      .spyOn(WebhookDuplicatesDb.prototype, 'insertManyOrUpdateManyCountWhenExist')
      .mockImplementation(() => Promise.reject(new Error('Error')));

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(getDuplicatesAndNoneDuplicatesSpy).toHaveBeenCalled();
    expect(webhookDuplicatesSpy).toHaveBeenCalled();
    expect(insertManyBlacklistSpy).toHaveBeenCalled();
    expect(updateManyEmailConfidenceSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual(expect.arrayContaining([expect.objectContaining(message2)]));
  });

  test('Should insert to blacklist and send all events message to DLQ when update pros fails', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE } });
    const message2 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE, recipient: TEST_EMAIL_2 },
    });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];
    getDuplicatesAndNoneDuplicatesSpy = mockGetDuplicatesAndNoneDuplicates(records, { noneDuplicates: [message1, message2] });
    updateManyEmailConfidenceSpy = jest
      .spyOn(ProDb.prototype, 'updateManyEmailConfidence')
      .mockImplementation(() => Promise.reject(new Error('Error')));

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(getDuplicatesAndNoneDuplicatesSpy).not.toHaveBeenCalled();
    expect(webhookDuplicatesSpy).not.toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual(
      expect.arrayContaining([expect.objectContaining(message1), expect.objectContaining(message2)]),
    );
  });
});
