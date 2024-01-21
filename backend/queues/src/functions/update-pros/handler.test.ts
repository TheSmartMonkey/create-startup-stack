/**
 * @group unit
 */
import { describe, expect, test } from '@jest/globals';
import { ProDb } from '@libs/db/pro/pro.db';
import { WebhookDuplicatesDb } from '@libs/db/webhook-duplicates/webhook-duplicates.db';
import { Fake, TEST_EMAIL_2 } from '@libs/tests/fake';
import { initUnitTests, initUnitTestsSpies, InitUnitTestsSpies } from '@libs/tests/init-unit';
import { executeLambdaSQS, generateValidatedSQSEvent, mockGetDuplicatesAndNoneDuplicates } from '@libs/tests/mocks';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { main } from './handler';

describe('updatePros unit', () => {
  let initSpies: InitUnitTestsSpies;
  let getDuplicatesAndNoneDuplicatesSpy: jest.SpyInstance;
  let updateManyEmailConfidenceSpy: jest.SpyInstance;
  let webhookDuplicatesSpy: jest.SpyInstance;

  beforeAll(() => {
    initUnitTests();
  });

  beforeEach(() => {
    initSpies = initUnitTestsSpies();
    getDuplicatesAndNoneDuplicatesSpy = mockGetDuplicatesAndNoneDuplicates([], {});
    updateManyEmailConfidenceSpy = jest.spyOn(ProDb.prototype, 'updateManyEmailConfidence').mockImplementation(() => Promise.resolve([]));
    webhookDuplicatesSpy = jest
      .spyOn(WebhookDuplicatesDb.prototype, 'insertManyOrUpdateManyCountWhenExist')
      .mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should update pros when records are passed', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({});
    const message2 = new Fake().mailgunEvent({ eventData: { recipient: TEST_EMAIL_2 } });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];
    getDuplicatesAndNoneDuplicatesSpy = mockGetDuplicatesAndNoneDuplicates(records, { noneDuplicates: [message1, message2] });

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(getDuplicatesAndNoneDuplicatesSpy).toHaveBeenCalled();
    expect(updateManyEmailConfidenceSpy).toHaveBeenCalled();
    expect(webhookDuplicatesSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy.mock.calls[0][0]).toHaveLength(0);
  });

  test('Should not update pros when no records are passed', async () => {
    // Given
    const records = [] as any[];

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(getDuplicatesAndNoneDuplicatesSpy).not.toHaveBeenCalled();
    expect(updateManyEmailConfidenceSpy).not.toHaveBeenCalled();
    expect(webhookDuplicatesSpy).not.toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy).not.toHaveBeenCalled();
  });

  test('Should send not processed message to DLQ when updating pros', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({});
    const message2 = new Fake().mailgunEvent({
      eventData: { id: 'message2id', event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE, recipient: TEST_EMAIL_2 },
    });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(getDuplicatesAndNoneDuplicatesSpy).toHaveBeenCalled();
    expect(updateManyEmailConfidenceSpy).toHaveBeenCalled();
    expect(webhookDuplicatesSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy.mock.calls[0][0]).toHaveLength(0);
  });

  test('Should send events to DLQ when update query failed', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { id: 'message1id' } });
    const message2 = new Fake().mailgunEvent({ eventData: { id: 'message2id', recipient: TEST_EMAIL_2 } });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];
    updateManyEmailConfidenceSpy = jest
      .spyOn(ProDb.prototype, 'updateManyEmailConfidence')
      .mockImplementationOnce(() => Promise.reject(new Error('Error')));
    const message1dlq = new Fake().dlqMailgunEvent({ eventData: { id: 'message1id' } });
    const message2dlq = new Fake().dlqMailgunEvent({ eventData: { id: 'message2id', recipient: TEST_EMAIL_2 } });

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(updateManyEmailConfidenceSpy).toHaveBeenCalled();
    expect(getDuplicatesAndNoneDuplicatesSpy).not.toHaveBeenCalled();
    expect(webhookDuplicatesSpy).not.toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual(
      expect.arrayContaining([expect.objectContaining(message1dlq), expect.objectContaining(message2dlq)]),
    );
  });
});
