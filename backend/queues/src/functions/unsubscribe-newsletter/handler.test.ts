/**
 * @group unit
 */
import { describe, expect, test } from '@jest/globals';
import { MongoDbAdapter } from '@libs/adapter/mongodb.adapter';
import { MongooseAdapter } from '@libs/adapter/mongoose.adapter';
import { WebhookDuplicatesDb } from '@libs/db/webhook-duplicates/webhook-duplicates.db';
import { Fake, TEST_EMAIL_2 } from '@libs/tests/fake';
import { initUnitTests, InitUnitTestsSpies, initUnitTestsSpies } from '@libs/tests/init-unit';
import { executeLambdaSQS, generateValidatedSQSEvent, mockGetDuplicatesAndNoneDuplicates } from '@libs/tests/mocks';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { main } from './handler';
import { MailServicesDb } from '@libs/db/mail-services/mail-services.db';
import { ProDb } from '@libs/db/pro/pro.db';

describe('unsubscribeNewsletter unit', () => {
  let initSpies: InitUnitTestsSpies;
  let getDuplicatesAndNoneDuplicatesSpy: jest.SpyInstance;
  let updateUnsubscriptionOfNewsletterStatsSpy: jest.SpyInstance;
  let unsubscribeProNewsLetterSpy: jest.SpyInstance;
  let webhookDuplicatesSpy: jest.SpyInstance;

  beforeAll(() => {
    initUnitTests();
  });

  beforeEach(() => {
    initSpies = initUnitTestsSpies();
    jest.spyOn(MongooseAdapter, 'connect').mockImplementation(() => Promise.resolve());
    jest.spyOn(MongoDbAdapter, 'connect').mockImplementation(() => Promise.resolve());
    getDuplicatesAndNoneDuplicatesSpy = mockGetDuplicatesAndNoneDuplicates([], {});
    unsubscribeProNewsLetterSpy = jest.spyOn(ProDb.prototype, 'unsubscribeProNewsLetter').mockImplementation(() => Promise.resolve([]));
    updateUnsubscriptionOfNewsletterStatsSpy = jest
      .spyOn(MailServicesDb.prototype, 'updateUnsubscriptionOfNewsletterStats')
      .mockImplementation();
    webhookDuplicatesSpy = jest
      .spyOn(WebhookDuplicatesDb.prototype, 'insertManyOrUpdateManyCountWhenExist')
      .mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should pass the process when no unsubscribe events', async () => {
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
    expect(getDuplicatesAndNoneDuplicatesSpy).not.toHaveBeenCalled();
    expect(unsubscribeProNewsLetterSpy).not.toHaveBeenCalled();
    expect(updateUnsubscriptionOfNewsletterStatsSpy).not.toHaveBeenCalled();
    expect(webhookDuplicatesSpy).not.toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy).not.toHaveBeenCalled();
  });

  test('Should start process of subscription when no records are passed', async () => {
    // Given
    const records = [] as any[];

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(getDuplicatesAndNoneDuplicatesSpy).not.toHaveBeenCalled();
    expect(unsubscribeProNewsLetterSpy).not.toHaveBeenCalled();
    expect(updateUnsubscriptionOfNewsletterStatsSpy).not.toHaveBeenCalled();
    expect(webhookDuplicatesSpy).not.toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy).not.toHaveBeenCalled();
  });

  test('Should send failed message to DLQ when updateUnsubscriptionOfNewsletterStats fails', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE } });
    const message2 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];
    getDuplicatesAndNoneDuplicatesSpy = mockGetDuplicatesAndNoneDuplicates(records, { noneDuplicates: [message1, message2] });
    webhookDuplicatesSpy = jest
      .spyOn(WebhookDuplicatesDb.prototype, 'insertManyOrUpdateManyCountWhenExist')
      .mockImplementation(() => Promise.reject(new Error('Error')));
    updateUnsubscriptionOfNewsletterStatsSpy = jest
      .spyOn(MailServicesDb.prototype, 'updateUnsubscriptionOfNewsletterStats')
      .mockImplementation(() => Promise.reject(new Error('Error')));

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(updateUnsubscriptionOfNewsletterStatsSpy).toHaveBeenCalled();
    expect(unsubscribeProNewsLetterSpy).toHaveBeenCalled();
    expect(getDuplicatesAndNoneDuplicatesSpy).not.toHaveBeenCalled();
    expect(webhookDuplicatesSpy).not.toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual(expect.arrayContaining([expect.objectContaining(message2)]));
  });

  test('Should finish subscription process and send not processed message to DLQ when webhook duplicates fails', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE } });
    const message2 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });
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
    expect(unsubscribeProNewsLetterSpy).toHaveBeenCalled();
    expect(updateUnsubscriptionOfNewsletterStatsSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual(expect.arrayContaining([expect.objectContaining(message2)]));
  });
});
