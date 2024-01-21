import { MongoDbAdapter } from '@libs/adapter/mongodb.adapter';
import { MongooseAdapter } from '@libs/adapter/mongoose.adapter';
import { ProDb } from '@libs/db/pro/pro.db';
import { WebhookDuplicatesDb } from '@libs/db/webhook-duplicates/webhook-duplicates.db';
import { MailgunService } from '@libs/services/mailgun';
import { Errors } from '@libs/utils/errors';
import { LambdaUtils } from '@libs/utils/lambda';
import { SqsUtils } from '@libs/utils/sqs';
import { MailgunEntityEnum } from '@models/mailgun/mailgun-events.model';
import { Mailgun } from '@models/mailgun/mailgun.model';
import { Context, SQSEvent } from 'aws-lambda';

export async function main(event: SQSEvent, context: Context): Promise<void> {
  try {
    // Avoid creating a new mongoDb connection
    context.callbackWaitsForEmptyEventLoop = false;

    // Get events
    const mailgun = new MailgunService();
    const messages = SqsUtils.getMessagesFromSQSRecords<Mailgun>(event?.Records);
    const uniqueMessages = SqsUtils.removeDuplicateMailgunEvents(messages);
    const mailgunEvents = mailgun.filterMessagesFromSQS(uniqueMessages, MailgunEntityEnum.PRO);
    const verifiedMailgunEvents = mailgun.verifyAllSignatures(mailgunEvents);
    if (!verifiedMailgunEvents.length) return;

    // Add verified events in db
    await MongoDbAdapter.connect();
    await MongooseAdapter.connect();
    const noneProcessed = await new ProDb().updateManyEmailConfidence(verifiedMailgunEvents, { emailConfidence: 100 });
    const { duplicates, noneDuplicates } = await new WebhookDuplicatesDb().getDuplicatesAndNoneDuplicates(
      verifiedMailgunEvents,
      event?.Records,
      context,
    );
    await new WebhookDuplicatesDb().insertManyOrUpdateManyCountWhenExist(duplicates, noneDuplicates);

    // Add not processed messages to Dead Letter Queue
    const dlqName = process.env.UPDATE_PROS_EVENTS_QUEUE_DLQ_NAME;
    const dlqMessages = mailgun.mailgunToMailgunDLQModels(noneProcessed, dlqName, Errors.NOT_PROCESSED_MESSAGES_ERROR, {});
    await new SqsUtils().sendFailedEventsToDLQ(dlqMessages, context, dlqName);
  } catch (error) {
    const dlqName = process.env.UPDATE_PROS_EVENTS_QUEUE_DLQ_NAME;
    await LambdaUtils.catchSQSEventError(event, context, dlqName, { error });
  }
}
