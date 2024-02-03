/**
 * @group unit
 */
import { describe, expect, test } from '@jest/globals';
import { WebhookDuplicatesDb } from '@libs/db/webhook-duplicates/webhook-duplicates.db';
import { Fake, TEST_EMAIL_2 } from '@libs/tests/fake';
import { InitUnitTestsSpies, initUnitTests, initUnitTestsSpies } from '@libs/tests/init-unit';
import { executeLambdaSQS, generateValidatedSQSEvent, mockGetDuplicatesAndNoneDuplicates } from '@libs/tests/mocks';
import { MODELS } from '@models/api.model';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { main } from './handler';

describe('createTodo unit', () => {
  let initSpies: InitUnitTestsSpies;
  let insertManyBouncedSpy: jest.SpyInstance;
  let getDuplicatesAndNoneDuplicatesSpy: jest.SpyInstance;
  let duplicatesSpy: jest.SpyInstance;

  beforeAll(() => {
    initUnitTests();
  });

  beforeEach(() => {
    initSpies = initUnitTestsSpies();
    insertManyBouncedSpy = jest.spyOn(MODELS.Bounced, 'insertMany').mockImplementation(() => Promise.resolve());
    getDuplicatesAndNoneDuplicatesSpy = mockGetDuplicatesAndNoneDuplicates([], {});
    duplicatesSpy = jest
      .spyOn(WebhookDuplicatesDb.prototype, 'insertManyOrUpdateManyCountWhenExist')
      .mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should insert to bounced when records are passed', async () => {
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
    expect(insertManyBouncedSpy).toHaveBeenCalled();
    expect(duplicatesSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual([]);
  });

  test('Should not insert to bounced when records are passed', async () => {
    // Given
    const records = [] as any[];

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(getDuplicatesAndNoneDuplicatesSpy).not.toHaveBeenCalled();
    expect(insertManyBouncedSpy).not.toHaveBeenCalled();
    expect(duplicatesSpy).not.toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy).not.toHaveBeenCalled();
  });

  test('Should insert to bounced and send not processed message to DLQ', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE } });
    const message2 = new Fake().mailgunEvent({});
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];
    getDuplicatesAndNoneDuplicatesSpy = mockGetDuplicatesAndNoneDuplicates(records, { noneDuplicates: [message1, message2] });

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(getDuplicatesAndNoneDuplicatesSpy).toHaveBeenCalled();
    expect(insertManyBouncedSpy).toHaveBeenCalled();
    expect(duplicatesSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy).toHaveBeenCalled();
  });
});
