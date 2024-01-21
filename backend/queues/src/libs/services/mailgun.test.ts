/**
 * @group unit
 */
import { describe, expect, test } from '@jest/globals';
import { Fake } from '@libs/tests/fake';
import { initUnitTests } from '@libs/tests/init-unit';
import { MailgunEntityEnum, MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { MailgunService } from './mailgun';

describe('Mailgun service unit', () => {
  beforeAll(() => {
    initUnitTests();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Filter events by entity', () => {
    test('Should return click and open events when filter by pro', () => {
      // Given
      const message1 = new Fake().mailgunEvent({});
      const message2 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.OPENS } });
      const message3 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE } });
      const messages = [message1, message2, message3];

      // When
      const response = new MailgunService().filterMessagesFromSQS(messages, MailgunEntityEnum.PRO);

      // Then
      expect(response).toHaveLength(2);
      expect(response).toEqual(expect.arrayContaining([expect.objectContaining(message1), expect.objectContaining(message2)]));
    });

    test('Should return all the events when filter by all', () => {
      // Given
      const message1 = new Fake().mailgunEvent({});
      const message2 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.OPENS } });
      const message3 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE } });
      const message4 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.UNSUBSCRIBES } });
      const messages = [message1, message2, message3, message4];

      // When
      const response = new MailgunService().filterMessagesFromSQS(messages, MailgunEntityEnum.ALL);

      // Then
      expect(response).toHaveLength(4);
      expect(response).toEqual(
        expect.arrayContaining([
          expect.objectContaining(message1),
          expect.objectContaining(message2),
          expect.objectContaining(message3),
          expect.objectContaining(message4),
        ]),
      );
    });
  });

  describe('Signature', () => {
    test('Should return 2 events when signature is valide', () => {
      // Given
      const message1 = new Fake().mailgunEvent({});
      const message2 = new Fake().mailgunEvent({});

      // When
      const response = new MailgunService().verifyAllSignatures([message1, message2]);

      // Then
      expect(response).toHaveLength(2);
      expect(response).toEqual(expect.arrayContaining([expect.objectContaining(message1), expect.objectContaining(message2)]));
    });

    test('Should return 1 event when signature is valide only for 1 event', () => {
      // Given
      const message1 = new Fake().mailgunEvent({});
      const message2 = new Fake().mailgunEvent({ signature: new Fake().invalideSignature() });

      // When
      const response = new MailgunService().verifyAllSignatures([message1, message2]);

      // Then
      expect(response).toHaveLength(1);
      expect(response).toEqual([message1]);
    });

    test('Should return empty list when signature is not valide', () => {
      // Given
      const message1 = new Fake().mailgunEvent({ signature: new Fake().invalideSignature() });
      const message2 = new Fake().mailgunEvent({ signature: new Fake().invalideSignature() });

      // When
      const response = new MailgunService().verifyAllSignatures([message1, message2]);

      // Then
      expect(response).toHaveLength(0);
    });
  });
});
