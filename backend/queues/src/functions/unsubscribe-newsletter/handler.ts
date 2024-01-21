import { MongoDbAdapter } from '@libs/adapter/mongodb.adapter';
import { MongooseAdapter } from '@libs/adapter/mongoose.adapter';
import { WebhookDuplicatesDb } from '@libs/db/webhook-duplicates/webhook-duplicates.db';
import { LambdaUtils } from '@libs/utils/lambda';
import { SqsUtils } from '@libs/utils/sqs';
import { MailgunEntityEnum } from '@models/mailgun/mailgun-events.model';
import { Mailgun } from '@models/mailgun/mailgun.model';
import { Context, SQSEvent } from 'aws-lambda';
import { MailServicesDb } from '@libs/db/mail-services/mail-services.db';
import { MailgunService } from '@libs/services/mailgun';
import { ProDb } from '@libs/db/pro/pro.db';
import { Errors } from '@libs/utils/errors';

export async function main(event: SQSEvent, context: Context): Promise<void> {
  try {
    // Avoid creating a new mongoDb connection
    context.callbackWaitsForEmptyEventLoop = false;

    // Get events
    const mailgun = new MailgunService();
    const messages = SqsUtils.getMessagesFromSQSRecords<Mailgun>(event?.Records);
    const uniqueMessages = SqsUtils.removeDuplicateMailgunEvents(messages);
    const mailgunEvents = mailgun.filterMessagesFromSQS(uniqueMessages, MailgunEntityEnum.UNSUBSCRIBE);
    const verifiedMailgunEvents = mailgun.verifyAllSignatures(mailgunEvents);
    if (!verifiedMailgunEvents.length) return;

    // Add verified events in db
    await MongooseAdapter.connect();
    await MongoDbAdapter.connect();
    const noneUnsubscribe = await new ProDb().unsubscribeProNewsLetter(verifiedMailgunEvents);
    await new MailServicesDb().updateUnsubscriptionOfNewsletterStats(verifiedMailgunEvents);

    const { duplicates, noneDuplicates } = await new WebhookDuplicatesDb().getDuplicatesAndNoneDuplicates(
      verifiedMailgunEvents,
      event?.Records,
      context,
    );
    await new WebhookDuplicatesDb().insertManyOrUpdateManyCountWhenExist(duplicates, noneDuplicates);
    // Add not processed messages to Dead Letter Queue
    const dlqName = process.env.UNSUBSCRIBE_NEWSLETTER_EVENTS_QUEUE_DLQ_NAME;
    const dlqMessages = mailgun.mailgunToMailgunDLQModels(noneUnsubscribe, dlqName, Errors.NOT_PROCESSED_MESSAGES_ERROR, {});
    await new SqsUtils().sendFailedEventsToDLQ(dlqMessages, context, dlqName);
  } catch (error) {
    const dlqName = process.env.UNSUBSCRIBE_NEWSLETTER_EVENTS_QUEUE_DLQ_NAME;
    await LambdaUtils.catchSQSEventError(event, context, dlqName, { error });
  }
}
