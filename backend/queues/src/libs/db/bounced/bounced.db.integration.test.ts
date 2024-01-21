/**
 * @group integration
 */
import { describe, expect, test } from '@jest/globals';
import { MongooseAdapter } from '@libs/adapter/mongoose.adapter';
import { Fake, TEST_EMAIL_2 } from '@libs/tests/fake';
import { Generate } from '@libs/tests/generate';
import { initIntegrationTests } from '@libs/tests/init-integration';
import { cleanupIntegrationTestsDropMongoDbCollections } from '@libs/tests/utils';
import { MODELS } from '@models/api.model';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { BouncedDb } from './bounced.db';

jest.setTimeout(20000);

describe('BouncedDb integration', () => {
  beforeAll(async () => {
    initIntegrationTests();
    await MongooseAdapter.connect();
  });

  afterAll(async () => {
    await cleanupIntegrationTestsDropMongoDbCollections();
    await MongooseAdapter.disconnect();
  });

  beforeEach(async () => {
    await MODELS.Bounced.deleteMany({});
  });

  describe('insertMany', () => {
    test('Should insert 2 bounced items and return an empty array', async () => {
      // Given
      const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });
      const message2 = new Fake().mailgunEvent({
        eventData: { event: MailgunEventEnum.SPAM_COMPLAINTS, recipient: TEST_EMAIL_2 },
      });

      // When
      const response = await new BouncedDb().insertMany([message1, message2]);
      const scanBounced = await MODELS.Bounced.find();

      // Then
      expect(response).toHaveLength(0);
      expect(scanBounced).toHaveLength(2);
      expect(scanBounced).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ email: message1['event-data'].recipient }),
          expect.objectContaining({ email: message2['event-data'].recipient }),
        ]),
      );
    });

    test('Should insert 1 bounced when 1 event already exist', async () => {
      // Given
      const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });
      const message2 = new Fake().mailgunEvent({
        eventData: { event: MailgunEventEnum.SPAM_COMPLAINTS, recipient: TEST_EMAIL_2 },
      });
      await new Generate().createBounced();

      // When
      const response = await new BouncedDb().insertMany([message1, message2]);
      const scanBounced = await MODELS.Bounced.find();

      // Then
      expect(response).toHaveLength(0);
      expect(scanBounced).toHaveLength(2);
      expect(scanBounced).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ email: message1['event-data'].recipient }),
          expect.objectContaining({ email: message2['event-data'].recipient }),
        ]),
      );
    });

    test('Should not fail on duplicate key error', async () => {
      // Given
      const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });
      const message2 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.SPAM_COMPLAINTS } });

      // When
      const response = await new BouncedDb().insertMany([message1, message2]);
      const scanBounced = await MODELS.Bounced.find();

      // Then
      expect(response).toHaveLength(0);
      expect(scanBounced).toHaveLength(1);
      expect(scanBounced).toEqual(expect.arrayContaining([expect.objectContaining({ email: message1['event-data'].recipient })]));
    });
  });
});
