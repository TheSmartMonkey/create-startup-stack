/**
 * @group integration
 */
import { describe, expect, test } from '@jest/globals';
import { MongooseAdapter } from '@libs/adapter/mongoose.adapter';
import { Fake, TEST_EMAIL, TEST_EMAIL_2 } from '@libs/tests/fake';
import { initIntegrationTests } from '@libs/tests/init-integration';
import { executeLambdaSQS, generateValidatedSQSEvent } from '@libs/tests/mocks';
import { cleanupIntegrationTestsDropMongoDbCollections, getPro } from '@libs/tests/utils';
import { SqsUtils } from '@libs/utils/sqs';
import { MODELS } from '@models/api.model';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { main } from './handler';
import { MongoDbAdapter, mongoDbInstance } from '@libs/adapter/mongodb.adapter';
import { ObjectId } from 'mongodb';
import { DB_COLLECTIONS } from '@models/db.model';
import { Generate } from '@libs/tests/generate';

jest.setTimeout(20000);

describe('unsubscribeNewsletter integration', () => {
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
    await MODELS.MailService.deleteMany({});
    await MODELS.MailEvent.deleteMany({});
    await MODELS.WebhookDuplicates.deleteMany({});
    await mongoDbInstance.collection(DB_COLLECTIONS.NewsletterStats).deleteMany({});
    await mongoDbInstance.collection(DB_COLLECTIONS.Innovation).deleteMany({});
    await mongoDbInstance.collection(DB_COLLECTIONS.Pros).deleteMany({});
    sendFailedEventsToDLQSpy = jest.spyOn(SqsUtils.prototype, 'sendFailedEventsToDLQ').mockImplementation(() => Promise.resolve());
  });

  afterEach(async () => {
    await mongoDbInstance.collection(DB_COLLECTIONS.NewsletterStats).deleteMany({});
    await mongoDbInstance.collection(DB_COLLECTIONS.Innovation).deleteMany({});
    await mongoDbInstance.collection(DB_COLLECTIONS.Pros).deleteMany({});
  });

  test('Should create one newsletterStats and non duplicates', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.DELIVERED_MESSAGE } });
    const message2 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.UNSUBSCRIBES, recipient: TEST_EMAIL_2 },
      messageId: 'fake_message_id_1',
    });
    await new Generate().createPro({ email: TEST_EMAIL_2 });
    await new Generate().createPro({ email: TEST_EMAIL });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];
    const innovationId = new ObjectId('6572deb29da3b140a8598ae1');
    await mongoDbInstance.collection(DB_COLLECTIONS.Innovation).insertMany([{ _id: innovationId }]);
    const mailService1 = new Fake().mailService(innovationId.toString(), 'fake_message_id_1');
    await MODELS.MailService.insertMany([mailService1]);

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);
    const scanDuplicates = await MODELS.WebhookDuplicates.find();
    const newsletterStats = await mongoDbInstance.collection(DB_COLLECTIONS.NewsletterStats).find().toArray();
    const proAfter1 = await getPro(TEST_EMAIL_2);
    const proAfter2 = await getPro(TEST_EMAIL);

    // Then
    expect(scanDuplicates).toHaveLength(1);
    expect(newsletterStats).toHaveLength(1);
    expect(newsletterStats).toEqual(expect.arrayContaining([expect.objectContaining({ nbrUnsubscription: 1 })]));
    expect(sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(proAfter1.newsletter.isSubscribe).toBeFalsy();
    expect(proAfter2.newsletter).toBeUndefined();
  });

  test('Should add subscription when newsletterStats exists', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.DELIVERED_MESSAGE } });
    const message2 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.UNSUBSCRIBES, recipient: TEST_EMAIL_2 },
      messageId: 'fake_message_id_1',
    });
    await new Generate().createPro({ email: TEST_EMAIL_2 });
    await new Generate().createPro({ email: TEST_EMAIL });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];
    const innovationId = new ObjectId();
    const mailService1 = new Fake().mailService(innovationId.toString(), 'fake_message_id_1');
    await MODELS.MailService.insertMany([mailService1]);
    await mongoDbInstance.collection(DB_COLLECTIONS.NewsletterStats).insertMany([{ innovation: innovationId, nbrUnsubscription: 5 }]);

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);
    const scanDuplicates = await MODELS.WebhookDuplicates.find();
    const newsletterStats = await mongoDbInstance.collection(DB_COLLECTIONS.NewsletterStats).find().toArray();
    const proAfter1 = await getPro(TEST_EMAIL_2);
    const proAfter2 = await getPro(TEST_EMAIL);

    // Then
    expect(scanDuplicates).toHaveLength(1);
    expect(newsletterStats).toHaveLength(1);
    expect(proAfter1.newsletter.isSubscribe).toBeFalsy();
    expect(proAfter2.newsletter).toBeUndefined();
    expect(newsletterStats).toEqual(expect.arrayContaining([expect.objectContaining({ nbrUnsubscription: 6, innovation: innovationId })]));
    expect(sendFailedEventsToDLQSpy).toHaveBeenCalled();
  });
});
