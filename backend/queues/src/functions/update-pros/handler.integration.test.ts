/**
 * @group integration
 */
import { describe, expect, test } from '@jest/globals';
import { MongoDbAdapter } from '@libs/adapter/mongodb.adapter';
import { MongooseAdapter } from '@libs/adapter/mongoose.adapter';
import { Fake, TEST_EMAIL, TEST_EMAIL_2 } from '@libs/tests/fake';
import { Generate } from '@libs/tests/generate';
import { executeLambdaSQS, generateValidatedSQSEvent } from '@libs/tests/mocks';
import { initIntegrationTests } from '@libs/tests/init-integration';
import { cleanupIntegrationTestsDropMongoDbCollections } from '@libs/tests/utils';
import { SqsUtils } from '@libs/utils/sqs';
import { MODELS } from '@models/api.model';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { main } from './handler';
import { getPro } from '@libs/tests/utils';

jest.setTimeout(50000);
describe('UpdatePros integration', () => {
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
    await MODELS.WebhookDuplicates.deleteMany({});
    sendFailedEventsToDLQSpy = jest.spyOn(SqsUtils.prototype, 'sendFailedEventsToDLQ').mockImplementation(() => Promise.resolve());
  });

  test('Should updates pros email confiance be set to 100 when emailConfidence is not at 0', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.CLICKED } });
    const message2 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.OPENS, recipient: TEST_EMAIL_2 } });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];
    await new Generate().updateProEmailConfidence(TEST_EMAIL, { emailConfidence: 80 });
    await new Generate().updateProEmailConfidence(TEST_EMAIL_2, { emailConfidence: 0 });
    const pro1Before = await getPro(TEST_EMAIL);
    const pro2Before = await getPro(TEST_EMAIL_2);

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);
    const pro1After = await getPro(TEST_EMAIL);
    const pro2After = await getPro(TEST_EMAIL_2);

    // Then
    expect(pro1Before.emailConfidence).toEqual(80);
    expect(pro2Before.emailConfidence).toEqual(0);
    expect(pro1After.emailConfidence).toEqual(100);
    expect(pro2After.emailConfidence).toEqual(0);
    expect(sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual([]);
  });

  test('Should updates pros add mail to duplicates', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.CLICKED } });
    const message2 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.OPENS, recipient: TEST_EMAIL_2 } });
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
  });

  test('Should send events to DLQ when update query failed when email does not exist', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { id: 'message1id', recipient: 'testemaildoesnotexist@umi.com' } });
    const records = [Fake.sqsRecord(message1)];
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual(expect.arrayContaining([expect.objectContaining(message1)]));
  });
});
