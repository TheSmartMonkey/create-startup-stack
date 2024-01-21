/**
 * @group e2e
 */
import { describe, expect, test } from '@jest/globals';
import { initE2eTests } from '@libs/tests/init-e2e';
import { logger } from '@libs/utils/logger';
import { Utils } from '@libs/utils/utils';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import * as crypto from 'crypto';
import { E2e } from './e2e';

jest.setTimeout(50000);

describe('DLQ e2e', () => {
  const e2e = new E2e();

  beforeAll(() => {
    initE2eTests();
  });

  test('Should add to redirection-keep-all-messages-queue', async () => {
    // Given
    const message1 = { messageId: Utils.generateUUID() };
    const queueName = `mailing-webhook-service-redirection-keep-all-messages-queue-${process.env.AWS_STAGE}`;
    await e2e.deleteAllMessagesFromQueue(queueName);

    // When
    await Promise.all([e2e.sendMessageToApiGateway(message1).catch((e) => logger.error(e))]);
    const messages = await e2e.getMessagesFromQueue(queueName);
    logger.info(messages);

    // Then
    expect(messages).toEqual(expect.arrayContaining([expect.objectContaining(message1)]));
  });

  test('Should add to redirection-other-events-queue', async () => {
    // Given
    const message1 = { messageId: Utils.generateUUID(), 'event-data': { event: 'unknown' } };
    const queueName = `mailing-webhook-service-redirection-keep-other-events-queue-${process.env.AWS_STAGE}`;
    await e2e.deleteAllMessagesFromQueue(queueName);

    // When
    await Promise.all([e2e.sendMessageToApiGateway(message1).catch((e) => logger.error(e))]);
    const messages = await e2e.getMessagesFromQueue(queueName);
    logger.info(messages);

    // Then
    expect(messages).toEqual(expect.arrayContaining([expect.objectContaining(message1)]));
  });

  test('Should add to add-to-bounced-queue-dlq', async () => {
    // Given
    const message1 = { messageId: crypto.randomUUID(), 'event-data': { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE } };
    const queueName = `mailing-webhook-service-add-to-bounced-queue-dlq-${process.env.AWS_STAGE}`;
    await e2e.deleteAllMessagesFromQueue(queueName);

    // When
    await Promise.all([e2e.sendMessageToApiGateway(message1).catch((e) => logger.error(e))]);
    e2e.wait({ seconds: 20 });
    const messages = await e2e.getMessagesFromQueue(queueName);
    logger.info(messages);

    // Then
    expect(messages).toEqual(expect.arrayContaining([expect.objectContaining(message1)]));
  });

  test('Should add to add-to-blacklist-queue-dlq', async () => {
    // Given
    const message1 = { messageId: crypto.randomUUID(), 'event-data': { event: MailgunEventEnum.UNSUBSCRIBES } };
    const queueName = `mailing-webhook-service-add-to-blacklist-queue-dlq-${process.env.AWS_STAGE}`;
    await e2e.deleteAllMessagesFromQueue(queueName);

    // When
    await Promise.all([e2e.sendMessageToApiGateway(message1).catch((e) => logger.error(e))]);
    await e2e.wait({ seconds: 20 });
    const messages = await e2e.getMessagesFromQueue(queueName);
    logger.info(messages);

    // Then
    expect(messages).toEqual(expect.arrayContaining([expect.objectContaining(message1)]));
  });

  test('Should add to add-to-mail-events-queue-dlq', async () => {
    // Given
    const message1 = { messageId: crypto.randomUUID(), 'event-data': { event: MailgunEventEnum.DELIVERED_MESSAGE } };
    const queueName = `mailing-webhook-service-add-to-mail-events-queue-dlq-${process.env.AWS_STAGE}`;
    await e2e.deleteAllMessagesFromQueue(queueName);

    // When
    await Promise.all([e2e.sendMessageToApiGateway(message1).catch((e) => logger.error(e))]);
    await e2e.wait({ seconds: 20 });
    const messages = await e2e.getMessagesFromQueue(queueName);
    logger.info(messages);

    // Then
    expect(messages).toEqual(expect.arrayContaining([expect.objectContaining(message1)]));
  });

  test('Should add to update-pros-queue-dlq', async () => {
    // Given
    const message1 = { messageId: crypto.randomUUID(), 'event-data': { event: MailgunEventEnum.OPENS } };
    const queueName = `mailing-webhook-service-update-pros-queue-dlq-${process.env.AWS_STAGE}`;
    await e2e.deleteAllMessagesFromQueue(queueName);

    // When
    await Promise.all([e2e.sendMessageToApiGateway(message1).catch((e) => logger.error(e))]);
    e2e.wait({ seconds: 20 });
    const messages = await e2e.getMessagesFromQueue(queueName);
    logger.info(messages);

    // Then
    expect(messages).toEqual(expect.arrayContaining([expect.objectContaining(message1)]));
  });

  test('Should add to unsubscribe-newsletter', async () => {
    // Given
    const message1 = { messageId: crypto.randomUUID(), 'event-data': { event: MailgunEventEnum.UNSUBSCRIBES } };
    const queueName = `mailing-webhook-service-unsubscribe-newsletter-queue-dlq-${process.env.AWS_STAGE}`;
    await e2e.deleteAllMessagesFromQueue(queueName);

    // When
    await Promise.all([e2e.sendMessageToApiGateway(message1).catch((e) => logger.error(e))]);
    await e2e.wait({ seconds: 20 });
    const messages = await e2e.getMessagesFromQueue(queueName);
    logger.info(messages);

    // Then
    expect(messages).toEqual(expect.arrayContaining([expect.objectContaining(message1)]));
  });
});
