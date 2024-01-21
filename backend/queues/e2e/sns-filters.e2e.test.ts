/**
 * @group e2e
 */
import { describe, expect, test } from '@jest/globals';
import { MongoDbAdapter, mongoDbInstance } from '@libs/adapter/mongodb.adapter';
import { MongooseAdapter } from '@libs/adapter/mongoose.adapter';
import { Fake, TEST_EMAIL_2 } from '@libs/tests/fake';
import { Generate } from '@libs/tests/generate';
import { initE2eTests } from '@libs/tests/init-e2e';
import { logger } from '@libs/utils/logger';
import { MODELS } from '@models/api.model';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { E2e } from './e2e';
import { ObjectId } from 'bson';
import { DB_COLLECTIONS } from '@models/db.model';

jest.setTimeout(50000);

describe('SNS filters e2e', () => {
  const e2e = new E2e();

  beforeAll(async () => {
    initE2eTests();
    await MongooseAdapter.connect();
    await MongoDbAdapter.connect();
    await new Generate().deleteAllpros();
    await new Generate().deleteAllNewsletterStats();
    await new Generate().deleteAllInnovations();
    await new Generate().deleteAllMailServices();
    await Promise.all([new Generate().createPro(), new Generate().createPro({ email: TEST_EMAIL_2 })]);
  });

  afterAll(async () => {
    await MongooseAdapter.disconnect();
    await MongoDbAdapter.disconnect();
  });

  test('Should add mailgun events in blacklist, bounced and mailevent', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE } });
    const message2 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE, recipient: TEST_EMAIL_2 },
    });
    await Promise.all([
      MODELS.Bounced.deleteMany({}).catch((e) => logger.error(e)),
      MODELS.Blacklist.deleteMany({}).catch((e) => logger.error(e)),
      MODELS.MailEvent.deleteMany({}).catch((e) => logger.error(e)),
      MODELS.WebhookDuplicates.deleteMany({}).catch((e) => logger.error(e)),
    ]);

    // When
    await Promise.all([
      e2e.sendMessageToApiGateway(message1).catch((e) => logger.error(e)),
      e2e.sendMessageToApiGateway(message2).catch((e) => logger.error(e)),
    ]);
    await e2e.wait({ seconds: 40 });
    const bounced = await MODELS.Bounced.find();
    const blacklist = await MODELS.Blacklist.find();
    const mailevent = await MODELS.MailEvent.find();

    // Then
    expect(bounced).toHaveLength(2);
    expect(blacklist).toHaveLength(2);
    expect(mailevent).toHaveLength(2);
  });

  test('Should update pro send message to dlq when email does not exist', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({});
    const queueName = `mailing-webhook-service-update-pros-queue-dlq-${process.env.AWS_STAGE}`;
    await new Generate().deleteAllpros();
    await e2e.deleteAllMessagesFromQueue(queueName);

    // When
    await e2e.sendMessageToApiGateway(message1);
    await e2e.wait({ seconds: 40 });
    const messages = await e2e.getMessagesFromQueue(queueName);

    // Then
    expect(messages).toEqual(expect.arrayContaining([expect.objectContaining(message1)]));
  });

  test('Should create a new newsletter stats when unsubscribe', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES }, messageId: 'fake_message_id' });
    const queueName = `mailing-webhook-service-unsubscribe-newsletter-queue-dlq-${process.env.AWS_STAGE}`;
    const innovationId = new ObjectId('6572deb29da3b140a8598ae1');
    await mongoDbInstance.collection(DB_COLLECTIONS.Innovation).insertMany([{ _id: innovationId }]);
    const mailService1 = new Fake().mailService(innovationId.toString(), 'fake_message_id');
    const mailService2 = new Fake().mailService(innovationId.toString(), 'fake_message_id', 'not_recontact');
    await MODELS.MailService.insertMany([mailService1, mailService2]);
    await e2e.deleteAllMessagesFromQueue(queueName);

    // When
    await Promise.all([e2e.sendMessageToApiGateway(message1).catch((e) => logger.error(e))]);
    await e2e.wait({ seconds: 40 });
    const allNewsletterStats = await mongoDbInstance.collection(DB_COLLECTIONS.NewsletterStats).find().toArray();

    // Then
    expect(allNewsletterStats).toHaveLength(1);
    expect(allNewsletterStats).toEqual(
      expect.arrayContaining([expect.objectContaining({ nbrUnsubscription: 1, innovation: innovationId })]),
    );
  });
});
