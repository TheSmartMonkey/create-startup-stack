/**
 * @group integration
 */
import { describe, expect, test } from '@jest/globals';
import { MongoDbAdapter } from '@libs/adapter/mongodb.adapter';
import { Fake, TEST_EMAIL, TEST_EMAIL_2 } from '@libs/tests/fake';
import { Generate } from '@libs/tests/generate';
import { initIntegrationTests } from '@libs/tests/init-integration';
import { cleanupIntegrationTestsDropMongoDbCollections, getPro } from '@libs/tests/utils';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { ProDb } from './pro.db';

jest.setTimeout(20000);

describe('ProDb integration', () => {
  beforeAll(async () => {
    initIntegrationTests();
    await MongoDbAdapter.connect();
  });

  afterAll(async () => {
    await cleanupIntegrationTestsDropMongoDbCollections();
    await MongoDbAdapter.disconnect();
  });

  beforeEach(async () => {
    await new Generate().deleteAllpros();
    await new Generate().createPro();
    await new Generate().createPro({ email: TEST_EMAIL_2 });
  });

  describe('updateManyEmailConfidence', () => {
    test('Should update emailConfidence to 100 for noneDuplicate events', async () => {
      // Given
      const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.OPENS } });
      const message2 = new Fake().mailgunEvent({ eventData: { recipient: TEST_EMAIL_2 } });
      const pro1Before = await getPro(TEST_EMAIL);
      const pro2Before = await getPro(TEST_EMAIL_2);

      // When
      const response = await new ProDb().updateManyEmailConfidence([message1, message2], { emailConfidence: 100 });
      const pro1After = await getPro(TEST_EMAIL);
      const pro2After = await getPro(TEST_EMAIL_2);

      // Then
      expect(response).toHaveLength(0);
      expect(pro1Before.emailConfidence).toEqual(80);
      expect(pro2Before.emailConfidence).toEqual(80);
      expect(pro1After.emailConfidence).toEqual(100);
      expect(pro2After.emailConfidence).toEqual(100);
    });

    test('Should update emailConfidence to 100 even when email is duplicate', async () => {
      // Given
      const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.OPENS } });
      const message2 = new Fake().mailgunEvent({ eventData: { recipient: TEST_EMAIL_2 } });
      await new Generate().createPro({ email: TEST_EMAIL_2 });
      const pro2Before = await getPro(TEST_EMAIL_2);

      // When
      const response = await new ProDb().updateManyEmailConfidence([message1, message2], { emailConfidence: 100 });
      const pro2After = await getPro(TEST_EMAIL_2);

      // Then
      expect(response).toHaveLength(0);
      expect(pro2Before.emailConfidence).toEqual(80);
      expect(pro2After.emailConfidence).toEqual(100);
    });

    test('Should update emailConfidence to 0 for noneDuplicate events', async () => {
      // Given
      const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.OPENS } });
      const message2 = new Fake().mailgunEvent({ eventData: { recipient: TEST_EMAIL_2 } });
      await new Generate().updateProEmailConfidence(TEST_EMAIL_2, { emailConfidence: 0 });
      const pro1Before = await getPro(TEST_EMAIL);
      const pro2Before = await getPro(TEST_EMAIL_2);

      // When
      const response = await new ProDb().updateManyEmailConfidence([message1, message2], { emailConfidence: 0 });
      const pro1After = await getPro(TEST_EMAIL);
      const pro2After = await getPro(TEST_EMAIL_2);

      // Then
      expect(response).toHaveLength(0);
      expect(pro1Before.emailConfidence).toEqual(80);
      expect(pro2Before.emailConfidence).toEqual(0);
      expect(pro1After.emailConfidence).toEqual(0);
      expect(pro2After.emailConfidence).toEqual(0);
    });

    test("Should not send noneProcessed events when emailConfidence dont' change after an update", async () => {
      // Given
      const message1 = new Fake().mailgunEvent({});
      await new Generate().updateProEmailConfidence(TEST_EMAIL, { emailConfidence: 100 });
      const pro1Before = await getPro(TEST_EMAIL);

      // When
      const response = await new ProDb().updateManyEmailConfidence([message1], { emailConfidence: 100 });
      const pro1After = await getPro(TEST_EMAIL);

      // Then
      expect(response).toHaveLength(0);
      expect(pro1Before.emailConfidence).toEqual(100);
      expect(pro1After.emailConfidence).toEqual(100);
    });

    test('Should not update pro and not send noneProcessed events when emailConfidence is at 0 and set to 100', async () => {
      // Given
      const message1 = new Fake().mailgunEvent({});
      await new Generate().updateProEmailConfidence(TEST_EMAIL, { emailConfidence: 0 });
      const pro1Before = await getPro(TEST_EMAIL);

      // When
      const response = await new ProDb().updateManyEmailConfidence([message1], { emailConfidence: 100 });
      const pro1After = await getPro(TEST_EMAIL);

      // Then
      expect(response).toHaveLength(0);
      expect(pro1Before.emailConfidence).toEqual(0);
      expect(pro1After.emailConfidence).toEqual(0);
    });

    test('Should not update pro and not send noneProcessed events when emailConfidence is at 0 and set to 0', async () => {
      // Given
      const message1 = new Fake().mailgunEvent({});
      await new Generate().updateProEmailConfidence(TEST_EMAIL, { emailConfidence: 0 });
      const pro1Before = await getPro(TEST_EMAIL);

      // When
      const response = await new ProDb().updateManyEmailConfidence([message1], { emailConfidence: 0 });
      const pro1After = await getPro(TEST_EMAIL);

      // Then
      expect(response).toHaveLength(0);
      expect(pro1Before.emailConfidence).toEqual(0);
      expect(pro1After.emailConfidence).toEqual(0);
    });

    test('Should return noneProcessed events when nothing as been modified', async () => {
      // Given
      const message1 = new Fake().mailgunEvent({ eventData: { recipient: 'unknown@umi.com' } });
      const pro1Before = await getPro('unknown@umi.com');

      // When
      const response = await new ProDb().updateManyEmailConfidence([message1], { emailConfidence: 100 });

      // Then
      expect(response).toHaveLength(1);
      expect(response).toEqual(expect.arrayContaining([expect.objectContaining(message1)]));
      expect(pro1Before).toBeNull();
    });
  });

  describe('unsubscribeProNewsLetter', () => {
    test('Should unsubscribe for noneDuplicate unsubscribed events', async () => {
      // Given
      const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });
      const message2 = new Fake().mailgunEvent({ eventData: { recipient: TEST_EMAIL_2 } });
      const pro1Before = await getPro(TEST_EMAIL);
      const pro2Before = await getPro(TEST_EMAIL_2);

      // When
      const response = await new ProDb().unsubscribeProNewsLetter([message1, message2]);
      const pro1After = await getPro(TEST_EMAIL);
      const pro2After = await getPro(TEST_EMAIL_2);

      // Then
      expect(response).toHaveLength(0);
      expect(pro1Before.newsletter).toBeUndefined();
      expect(pro2Before.newsletter).toBeUndefined();
      expect(pro1After.newsletter.isSubscribe).toBeFalsy();
      expect(pro2After.newsletter.isSubscribe).toBeFalsy();
    });

    test('Should unsubscribe when email is duplicate', async () => {
      // Given
      const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });
      const message2 = new Fake().mailgunEvent({ eventData: { recipient: TEST_EMAIL_2, event: MailgunEventEnum.UNSUBSCRIBES } });
      await new Generate().createPro({ email: TEST_EMAIL_2 });
      const pro2Before = await getPro(TEST_EMAIL_2);

      // When
      const response = await new ProDb().unsubscribeProNewsLetter([message1, message2]);
      const pro2After = await getPro(TEST_EMAIL_2);

      // Then
      expect(response).toHaveLength(0);
      expect(pro2Before.newsletter).toBeUndefined();
      expect(pro2After.newsletter.isSubscribe).toBeFalsy();
    });

    test('Should return noneProcessed events when no pro has been unsubscribed', async () => {
      // Given
      const message1 = new Fake().mailgunEvent({ eventData: { recipient: 'unknown@umi.com' } });
      const pro1Before = await getPro('unknown@umi.com');

      // When
      const response = await new ProDb().unsubscribeProNewsLetter([message1]);

      // Then
      expect(response).toHaveLength(1);
      expect(pro1Before).toBeNull();
    });
  });
});
