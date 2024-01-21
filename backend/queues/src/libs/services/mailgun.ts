import { Errors } from '@libs/utils/errors';
import { logger } from '@libs/utils/logger';
import { SqsUtils } from '@libs/utils/sqs';
import { MailgunEntityEnum, MailgunEventEnum, mailgunEventsByEntity } from '@models/mailgun/mailgun-events.model';
import { Mailgun, MailgunDLQ, MailgunSignature } from '@models/mailgun/mailgun.model';
import { SQSRecord } from 'aws-lambda';
import * as crypto from 'crypto';

export class MailgunService {
  filterMessagesFromSQS(mailgunEvents: Mailgun[], entity: MailgunEntityEnum): Mailgun[] {
    const filterByEventType = mailgunEvents.filter((event) => this.isEventType(event, entity));
    logger.info({ numberOfEvents: mailgunEvents.length });
    logger.info({ numberOfFilteredEvents: filterByEventType.length });
    logger.info({ filteredEventTypes: mailgunEvents.map((mailgunEvent) => mailgunEvent['event-data'].event) });
    return filterByEventType;
  }

  verifyAllSignatures(mailgunEvents: Mailgun[]): Mailgun[] {
    const mailgunDomainKey = process.env.MAILGUN_DOMAIN_KEY ?? '';
    const verifiedMessages = mailgunEvents.filter((event) => {
      const mailgunSignature: MailgunSignature = {
        signature: event.signature.signature,
        token: event.signature.token,
        timestamp: event.signature.timestamp,
      };
      if (this.verifySignature(mailgunSignature, mailgunDomainKey)) {
        return true;
      }
      return false;
    });
    logger.info({ numberOfVerifiedMessages: verifiedMessages.length });
    return verifiedMessages;
  }

  mailgunToMailgunDLQModels(
    mailgunEvents: Mailgun[],
    dlqName: string | undefined,
    errorCode: Errors,
    { error }: { error?: any },
  ): MailgunDLQ[] {
    return mailgunEvents.map((mailgunEvent) => this.mailgunToMailgunDLQModel(mailgunEvent, dlqName, errorCode, { error }));
  }

  getEmailDomainFromMailgunEvent(mailgunEvent: Mailgun): string | undefined {
    const messageId = mailgunEvent?.['event-data']?.message.headers['message-id'];
    return messageId?.split('@')[1];
  }

  getSqsMessageIdByEmailAndEventType(sqsRecords: SQSRecord[], email: string, eventType: MailgunEventEnum): string {
    const sqsRecord = sqsRecords.find((sqsRecord) => {
      const message = SqsUtils.getMessageFromSQSRecord<Mailgun>(sqsRecord);
      const recipient = message?.['event-data'].recipient;
      const event = message?.['event-data'].event;
      return recipient === email && eventType === event;
    });
    if (!sqsRecord?.messageId) throw new Error(Errors.SQS_RECORD_MESSAGE_ID_NOT_FOUND);
    return sqsRecord.messageId;
  }

  private mailgunToMailgunDLQModel(
    mailgunEvent: Mailgun,
    dlqName: string | undefined,
    errorCode: Errors,
    { error }: { error?: any },
  ): MailgunDLQ {
    return {
      ...mailgunEvent,
      dlqError: {
        dlqName: dlqName ?? Errors.ENV_VARIABLE_DLQ_NAME_UNDEFINED,
        errorCode,
        error,
      },
    };
  }

  private isEventType(event: Mailgun, entity: MailgunEntityEnum): boolean {
    const eventType = this.getEventType(event);
    if (eventType) {
      return this.getEntitiesByEventType(eventType as MailgunEventEnum).includes(entity);
    }
    return false;
  }

  private getEventType(mailgunEvent: Mailgun): string | undefined {
    return mailgunEvent?.['event-data']?.event;
  }

  /**
   * Like a switch case on eventType that retruns entities
   * @param eventType MailgunEventEnum (spam, click...)
   * @returns A list of entities (blacklist...) and an empty list if no event correspond
   */
  private getEntitiesByEventType(eventType: MailgunEventEnum): MailgunEntityEnum[] {
    const onlyEntitiesWithEventType = Object.entries(mailgunEventsByEntity).filter((event) => event[1].includes(eventType));
    return onlyEntitiesWithEventType.map((entitie) => entitie[0] as MailgunEntityEnum);
  }

  private verifySignature(signature: MailgunSignature, mailgunDomainKey: string): boolean {
    try {
      const verify = crypto
        .createHmac('sha256', mailgunDomainKey)
        .update(Buffer.from(signature.timestamp + signature.token, 'utf-8'))
        .digest('hex');

      if (verify !== signature.signature) logger.info({ signature }, 'SIGNATURE_FAILED');

      return verify === signature.signature;
    } catch (error) {
      logger.error({ error });
    }
    return false;
  }
}
