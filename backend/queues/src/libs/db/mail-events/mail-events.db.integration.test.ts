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
import { MailEventsDb } from './mail-events.db';

jest.setTimeout(20000);

describe('MailEventsDb integration', () => {
  beforeAll(async () => {
    initIntegrationTests();
    await MongooseAdapter.connect();
  });

  afterAll(async () => {
    await cleanupIntegrationTestsDropMongoDbCollections();
    await MongooseAdapter.disconnect();
  });

  beforeEach(async () => {
    await MODELS.MailEvent.deleteMany({});
  });

  describe('insertMany', () => {
    test('Should insert 2 mailEvents items and return an empty array', async () => {
      // Given
      const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });
      const message2 = new Fake().mailgunEvent({
        eventData: { event: MailgunEventEnum.SPAM_COMPLAINTS, recipient: TEST_EMAIL_2 },
      });

      // When
      const response = await new MailEventsDb().insertMany([message1, message2]);
      const scanMailEvent = await MODELS.MailEvent.find();

      // Then
      expect(response).toHaveLength(0);
      expect(scanMailEvent).toHaveLength(2);
      expect(scanMailEvent).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ recipient: message1['event-data'].recipient, event: message1['event-data'].event }),
          expect.objectContaining({ recipient: message2['event-data'].recipient, event: message2['event-data'].event }),
        ]),
      );
    });

    test('Should insert 2 mailEvents items and return an empty array when email are the same', async () => {
      // Given
      const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });
      const message2 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.SPAM_COMPLAINTS } });

      // When
      const response = await new MailEventsDb().insertMany([message1, message2]);
      const scanMailEvent = await MODELS.MailEvent.find();

      // Then
      expect(response).toHaveLength(0);
      expect(scanMailEvent).toHaveLength(2);
      expect(scanMailEvent).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ recipient: message1['event-data'].recipient, event: message1['event-data'].event }),
          expect.objectContaining({ recipient: message2['event-data'].recipient, event: message2['event-data'].event }),
        ]),
      );
    });

    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('Should insert 1 mailEvents when 1 event already exist', async () => {
      // Given
      const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });
      const message2 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.SPAM_COMPLAINTS } });
      await new Generate().createMailEvent({ event: MailgunEventEnum.SPAM_COMPLAINTS });

      // When
      const response = await new MailEventsDb().insertMany([message1, message2]);
      const scanMailEvent = await MODELS.MailEvent.find();

      // Then
      expect(response).toHaveLength(0);
      expect(scanMailEvent).toHaveLength(2);
      expect(scanMailEvent).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ recipient: message1['event-data'].recipient, event: message1['event-data'].event }),
          expect.objectContaining({ recipient: message2['event-data'].recipient, event: message2['event-data'].event }),
        ]),
      );
    });

    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('Should not fail on duplicate key error when email and event are the same', async () => {
      // Given
      const message1 = new Fake().mailgunEvent({});
      const message2 = new Fake().mailgunEvent({});

      // When
      const response = await new MailEventsDb().insertMany([message1, message2]);
      const scanMailEvent = await MODELS.MailEvent.find();

      // Then
      expect(response).toHaveLength(0);
      expect(scanMailEvent).toHaveLength(1);
      expect(scanMailEvent).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ recipient: message1['event-data'].recipient, event: message1['event-data'].event }),
        ]),
      );
    });
  });
});
