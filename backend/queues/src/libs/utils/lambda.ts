import { MailgunService } from '@libs/services/mailgun';
import { Mailgun } from '@models/mailgun/mailgun.model';
import { Context, SQSEvent } from 'aws-lambda';
import { Errors } from './errors';
import { logger } from './logger';
import { SqsUtils } from './sqs';

export class LambdaUtils {
  static async catchSQSEventError(
    event: SQSEvent,
    context: Context,
    dlqName: string | undefined,
    { error }: { error?: any },
  ): Promise<any[]> {
    logger.error({ error });
    const messages = SqsUtils.getMessagesFromSQSRecords<Mailgun>(event?.Records);
    const uniqueMessages = SqsUtils.removeDuplicateMailgunEvents(messages);
    const dlqMessages = new MailgunService().mailgunToMailgunDLQModels(uniqueMessages, dlqName, Errors.UNKNOWN_ERROR, { error });
    await new SqsUtils().sendFailedEventsToDLQ(dlqMessages, context, dlqName);
    return [];
  }
}
