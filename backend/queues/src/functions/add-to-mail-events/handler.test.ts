/**
 * @group unit
 */
import { describe, expect, test } from '@jest/globals';
import { WebhookDuplicatesDb } from '@libs/db/webhook-duplicates/webhook-duplicates.db';
import { Fake } from '@libs/tests/fake';
import { initUnitTests, InitUnitTestsSpies, initUnitTestsSpies } from '@libs/tests/init-unit';
import { executeLambdaSQS, generateValidatedSQSEvent, mockGetDuplicatesAndNoneDuplicates } from '@libs/tests/mocks';
import { MODELS } from '@models/api.model';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { main } from './handler';

describe('addToMailEvents unit', () => {
  let initSpies: InitUnitTestsSpies;
  let insertManyMailEventsSpy: jest.SpyInstance;
  let webhookDuplicatesSpy: jest.SpyInstance;
  let getDuplicatesAndNoneDuplicatesSpy: jest.SpyInstance;

  beforeAll(() => {
    initUnitTests();
  });

  beforeEach(() => {
    initSpies = initUnitTestsSpies();
    getDuplicatesAndNoneDuplicatesSpy = mockGetDuplicatesAndNoneDuplicates([], {});
    insertManyMailEventsSpy = jest.spyOn(MODELS.MailEvent, 'insertMany').mockImplementation(() => Promise.resolve());
    webhookDuplicatesSpy = jest
      .spyOn(WebhookDuplicatesDb.prototype, 'insertManyOrUpdateManyCountWhenExist')
      .mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should insert to mail event when records are passed', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE } });
    const message2 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.CLICKED } });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];
    getDuplicatesAndNoneDuplicatesSpy = mockGetDuplicatesAndNoneDuplicates(records, { noneDuplicates: [message1, message2] });

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(getDuplicatesAndNoneDuplicatesSpy).toHaveBeenCalled();
    expect(insertManyMailEventsSpy).toHaveBeenCalled();
    expect(webhookDuplicatesSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual([]);
  });

  test('Should not insert to mail event when no records are passed', async () => {
    // Given
    const records = [] as any[];

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(getDuplicatesAndNoneDuplicatesSpy).not.toHaveBeenCalled();
    expect(insertManyMailEventsSpy).not.toHaveBeenCalled();
    expect(webhookDuplicatesSpy).not.toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy).not.toHaveBeenCalled();
  });

  test('Should insert to mail event and send not processed message to DLQ', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE } });
    const message2 = new Fake().mailgunEvent({ eventData: { event: 'failedMailgunEvent' as MailgunEventEnum } });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];
    getDuplicatesAndNoneDuplicatesSpy = mockGetDuplicatesAndNoneDuplicates(records, { noneDuplicates: [message1, message2] });

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(getDuplicatesAndNoneDuplicatesSpy).toHaveBeenCalled();
    expect(insertManyMailEventsSpy).toHaveBeenCalled();
    expect(webhookDuplicatesSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual([]);
  });

  test('Should insert to mail event and send not processed message to DLQ even when webhookDuplicates fails', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE } });
    const message2 = new Fake().mailgunEvent({ eventData: { event: 'failedMailgunEvent' as MailgunEventEnum } });
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
    expect(insertManyMailEventsSpy).toHaveBeenCalled();
    expect(webhookDuplicatesSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual(
      expect.arrayContaining([expect.objectContaining(message1), expect.objectContaining(message2)]),
    );
  });
});
