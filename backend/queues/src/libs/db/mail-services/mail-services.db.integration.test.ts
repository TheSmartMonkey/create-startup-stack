/**
 * @group integration
 */
import { describe, expect, test } from '@jest/globals';
import { MongooseAdapter } from '@libs/adapter/mongoose.adapter';
import { Fake } from '@libs/tests/fake';
import { initIntegrationTests } from '@libs/tests/init-integration';
import { MODELS } from '@models/api.model';
import { MailServicesDb } from './mail-services.db';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { MongoDbAdapter, mongoDbInstance } from '@libs/adapter/mongodb.adapter';
import { ObjectId } from 'mongodb';
import { cleanupIntegrationTestsDropMongoDbCollections } from '@libs/tests/utils';
import { DB_COLLECTIONS } from '@models/db.model';

jest.setTimeout(20000);

describe('MailServicesDb integration', () => {
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
    await mongoDbInstance.collection(DB_COLLECTIONS.Innovation).deleteMany({});
    await mongoDbInstance.collection(DB_COLLECTIONS.NewsletterStats).deleteMany({});
  });

  afterEach(async () => {
    await MODELS.MailService.deleteMany({});
    await mongoDbInstance.collection(DB_COLLECTIONS.Innovation).deleteMany({});
    await mongoDbInstance.collection(DB_COLLECTIONS.NewsletterStats).deleteMany({});
  });

  describe('updateUnsubscriptionOfNewsletterStats', () => {
    describe('1 good MailService for 1 innovation', () => {
      test('Should not create a newsletterStat when the MailEvent is not unsubscribed from recontact', async () => {
        // Given
        const messageId = 'fake_message_id_1';
        const mailEvent = new Fake().mailgunEvent({
          eventData: { event: MailgunEventEnum.UNSUBSCRIBES },
          messageId: messageId,
        });
        const innovationId = new ObjectId('6572deb29da3b140a8598ae1');
        await mongoDbInstance.collection(DB_COLLECTIONS.Innovation).insertMany([{ _id: innovationId }]);
        const mailService1 = new Fake().mailService(innovationId.toString(), messageId, 'first_answer');
        await MODELS.MailService.insertMany([mailService1]);

        // When
        await new MailServicesDb().updateUnsubscriptionOfNewsletterStats([mailEvent]);
        const allNewsletterStats = await mongoDbInstance.collection(DB_COLLECTIONS.NewsletterStats).find({}).toArray();

        // Then
        expect(allNewsletterStats).toHaveLength(0);
      });

      test('Should create a newsletterStat when there is none for the innovation, and unsubscribe should be 1', async () => {
        // Given
        const messageId = 'fake_message_id_1';
        const mailEvent = new Fake().mailgunEvent({
          eventData: { event: MailgunEventEnum.UNSUBSCRIBES },
          messageId: messageId,
        });
        const innovationId = new ObjectId('6572deb29da3b140a8598ae1');
        await mongoDbInstance.collection(DB_COLLECTIONS.Innovation).insertMany([{ _id: innovationId }]);
        const mailService1 = new Fake().mailService(innovationId.toString(), messageId);
        const mailService2 = new Fake().mailService(innovationId.toString(), messageId, 'not_recontact');
        await MODELS.MailService.insertMany([mailService1, mailService2]);

        // When
        await new MailServicesDb().updateUnsubscriptionOfNewsletterStats([mailEvent]);
        const allNewsletterStats = await mongoDbInstance.collection(DB_COLLECTIONS.NewsletterStats).find({}).toArray();

        // Then
        expect(allNewsletterStats).toHaveLength(1);
        expect(allNewsletterStats).toEqual(
          expect.arrayContaining([expect.objectContaining({ nbrUnsubscription: 1, innovation: new ObjectId('6572deb29da3b140a8598ae1') })]),
        );
      });

      test('Should add unsubscribe in newsletterStat when there is one for the innovation', async () => {
        // Given
        const messageId = 'fake_message_id_1';
        const innovationId = new ObjectId();
        const mailEvent = new Fake().mailgunEvent({
          eventData: { event: MailgunEventEnum.UNSUBSCRIBES },
          messageId: messageId,
        });
        const mailService = new Fake().mailService(innovationId.toString(), messageId);
        const newsletterStats = {
          innovation: innovationId,
          nbrUnsubscription: 5,
        };
        await MODELS.MailService.insertMany([mailService]);
        await mongoDbInstance.collection(DB_COLLECTIONS.NewsletterStats).insertMany([newsletterStats]);

        // When
        await new MailServicesDb().updateUnsubscriptionOfNewsletterStats([mailEvent]);
        const allNewsletterStats = await mongoDbInstance.collection(DB_COLLECTIONS.NewsletterStats).find({}).toArray();

        // Then
        expect(allNewsletterStats).toHaveLength(1);
        expect(allNewsletterStats).toEqual(
          expect.arrayContaining([expect.objectContaining({ nbrUnsubscription: 6, innovation: innovationId })]),
        );
      });

      test('Should keep the unsubscribe in old newsletterStat when innovation not matched and create a new newsletterStat', async () => {
        // Given
        const messageId = 'fake_message_id_1';
        const innovationId1 = new ObjectId();
        const mailEvent = new Fake().mailgunEvent({
          eventData: { event: MailgunEventEnum.UNSUBSCRIBES },
          messageId: messageId,
        });
        const innovationId2 = new ObjectId('62c45a8740ecb76ab4eee8b2');
        await mongoDbInstance.collection(DB_COLLECTIONS.Innovation).insertMany([{ _id: innovationId2 }]);
        const mailService = new Fake().mailService(innovationId2.toString(), messageId);
        const newsletterStats = {
          innovation: innovationId1,
          nbrUnsubscription: 5,
        };
        await MODELS.MailService.insertMany([mailService]);
        await mongoDbInstance.collection(DB_COLLECTIONS.NewsletterStats).insertMany([newsletterStats]);

        // When
        await new MailServicesDb().updateUnsubscriptionOfNewsletterStats([mailEvent]);
        const allNewsletterStats = await mongoDbInstance.collection(DB_COLLECTIONS.NewsletterStats).find({}).toArray();
        const newsletterStatsCreated = await mongoDbInstance
          .collection(DB_COLLECTIONS.NewsletterStats)
          .find({ innovation: innovationId2 })
          .toArray();
        const oldNewsletterStats = await mongoDbInstance
          .collection(DB_COLLECTIONS.NewsletterStats)
          .find({ innovation: innovationId1 })
          .toArray();

        // Then
        expect(allNewsletterStats).toHaveLength(2);
        expect(newsletterStatsCreated).toHaveLength(1);
        expect(oldNewsletterStats).toHaveLength(1);
        // new created one, should have nbrUnsubscription = 1
        expect(newsletterStatsCreated).toEqual(
          expect.arrayContaining([expect.objectContaining({ nbrUnsubscription: 1, innovation: innovationId2 })]),
        );
        // not matched newsletterStats should keep the same
        expect(oldNewsletterStats).toEqual(
          expect.arrayContaining([expect.objectContaining({ nbrUnsubscription: 5, innovation: innovationId1 })]),
        );
      });
    });

    describe('2 good MailService for 1 innovation', () => {
      test('Should create a newsletterStat when there is none for the innovation, and unsubscribe should be 2', async () => {
        // Given
        const messageId1 = 'fake_message_id_1';
        const messageId2 = 'fake_message_id_2';
        const messageId3 = 'fake_message_id_3';
        const mailEvent1 = new Fake().mailgunEvent({
          eventData: { event: MailgunEventEnum.UNSUBSCRIBES },
          messageId: messageId1,
        });
        const mailEvent2 = new Fake().mailgunEvent({
          eventData: { event: MailgunEventEnum.UNSUBSCRIBES },
          messageId: messageId2,
        });
        const mailEvent3 = new Fake().mailgunEvent({
          eventData: { event: MailgunEventEnum.UNSUBSCRIBES },
          messageId: messageId3,
        });
        const innovationId = new ObjectId('6572deb29da3b140a8598ae1');
        await mongoDbInstance.collection(DB_COLLECTIONS.Innovation).insertMany([{ _id: innovationId }]);
        const mailService1 = new Fake().mailService(innovationId.toString(), messageId1);
        const mailService2 = new Fake().mailService(innovationId.toString(), messageId2);
        const mailService3 = new Fake().mailService(innovationId.toString(), messageId3, 'not_recontact');
        await MODELS.MailService.insertMany([mailService1, mailService2, mailService3]);

        // When
        await new MailServicesDb().updateUnsubscriptionOfNewsletterStats([mailEvent1, mailEvent2, mailEvent3]);
        const allNewsletterStats = await mongoDbInstance.collection(DB_COLLECTIONS.NewsletterStats).find({}).toArray();

        // Then
        expect(allNewsletterStats).toHaveLength(1);
        expect(allNewsletterStats[0]['innovation'].toString()).toEqual(innovationId.toString());
        expect(allNewsletterStats[0]['nbrUnsubscription']).toEqual(2);
      });

      test('Should add unsubscribe on old newsletterStat when there is one for the innovation', async () => {
        // Given
        const messageId1 = 'fake_message_id_1';
        const messageId2 = 'fake_message_id_2';
        const messageId3 = 'fake_message_id_3';
        const innovationId = new ObjectId();
        const mailEvent1 = new Fake().mailgunEvent({
          eventData: { event: MailgunEventEnum.UNSUBSCRIBES },
          messageId: messageId1,
        });
        const mailEvent2 = new Fake().mailgunEvent({
          eventData: { event: MailgunEventEnum.UNSUBSCRIBES },
          messageId: messageId2,
        });
        const mailEvent3 = new Fake().mailgunEvent({
          eventData: { event: MailgunEventEnum.UNSUBSCRIBES },
          messageId: messageId3,
        });
        const mailService1 = new Fake().mailService(innovationId.toString(), messageId1);
        const mailService2 = new Fake().mailService(innovationId.toString(), messageId2);
        const mailService3 = new Fake().mailService(innovationId.toString(), messageId3, 'not_recontact');
        await MODELS.MailService.insertMany([mailService1, mailService2, mailService3]);
        const newsletterStats = {
          innovation: innovationId,
          nbrUnsubscription: 5,
        };
        await mongoDbInstance.collection(DB_COLLECTIONS.NewsletterStats).insertMany([newsletterStats]);

        // When
        await new MailServicesDb().updateUnsubscriptionOfNewsletterStats([mailEvent1, mailEvent2, mailEvent3]);
        const allNewsletterStats = await mongoDbInstance.collection(DB_COLLECTIONS.NewsletterStats).find({}).toArray();

        // Then
        expect(allNewsletterStats).toHaveLength(1);
        expect(allNewsletterStats).toEqual(
          expect.arrayContaining([expect.objectContaining({ nbrUnsubscription: 7, innovation: innovationId })]),
        );
      });
    });
  });
});
