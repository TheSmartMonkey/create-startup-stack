/**
 * @group unit
 */
import { describe, expect, test } from '@jest/globals';
import { Fake, TEST_EMAIL_2 } from '@libs/tests/fake';
import { initUnitTests } from '@libs/tests/init-unit';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { Mailgun } from '@models/mailgun/mailgun.model';
import { Context } from 'aws-lambda';
import { WebhookDuplicatesDb } from './webhook-duplicates.db';

describe('WebhookDuplicatesDb unit', () => {
  beforeAll(() => {
    initUnitTests();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should create webhook duplicates dao', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({});
    const message2 = new Fake().mailgunEvent({ eventData: { recipient: TEST_EMAIL_2 } });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];

    // When
    const response = new WebhookDuplicatesDb().mailgunEventsToDao([message1, message2], records, {
      functionName: 'fakeFunctionName',
    } as Context);

    // Then
    expect(response).toHaveLength(2);
  });

  test('Should create webhook duplicates dao when messageId is missing', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({});
    const message2 = new Fake().mailgunEvent({ eventData: { recipient: TEST_EMAIL_2 } });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];

    // When
    const response = new WebhookDuplicatesDb().mailgunEventsToDao([message1, message2], records, {
      functionName: 'fakeFunctionName',
    } as Context);

    // Then
    expect(response).toHaveLength(2);
  });

  test('Should create webhook duplicates dao when headers are missing', async () => {
    // Given
    const message1 = new Fake().mailgunEvent({});
    const message2: Mailgun = {
      signature: {
        token: 'd9ef7f5c9dfdb13ec19ac847a198074d328ee64a488013b8fd',
        timestamp: '1681886706',
        signature: 'dd841365591073575108130319ce42e1739d7104ce88d3acbd238215b66edfd2',
      },
      'event-data': {
        event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE,
        id: 'yY_s08N6RBqdw1-9XB-iBg',
        timestamp: 1681886706.9759276,
        envelope: {},
        message: {
          headers: {},
          size: 5158,
        },
        flags: {
          'is-delayed-bounce': true,
        },
        recipient: '1483@midasfrance.net',
        'recipient-domain': '',
        method: '',
        tags: [],
        campaigns: [],
        'delivery-status': {
          code: 550,
          'bounce-code': '5.0.0',
          message:
            "smtp; The email account that you tried to reach does not exist. Please try double-checking the recipient's email address for typos or unnecessary spaces. Learn more at https://support.google.com/mail/answer/6596",
        },
        severity: 'permanent',
        reason: 'generic',
      },
    } as unknown as Mailgun;
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];

    // When
    const response = new WebhookDuplicatesDb().mailgunEventsToDao([message1, message2], records, {
      functionName: 'fakeFunctionName',
    } as Context);

    // Then
    expect(response).toHaveLength(2);
    expect(response[0].mailgunMessageId).not.toBeUndefined();
    expect(response[1].mailgunMessageId).not.toBeUndefined();
  });
});
