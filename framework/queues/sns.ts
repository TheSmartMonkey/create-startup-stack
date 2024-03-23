import { generateUniqueId } from '@helpers/helper';
import { log } from '@helpers/logger';
import { SendSNSEvent } from '@models/queues/queue-service-events';
import { SNS } from 'aws-sdk';
import { PublishBatchRequestEntry } from 'aws-sdk/clients/sns';

let SNS_CLIENT: SNS;

export async function sendEventsToSNS<T>(sendSNSEvent: SendSNSEvent<T>): Promise<void> {
  const { events, topicArn, eventType } = sendSNSEvent;
  if (!events.length) return;
  const entries: PublishBatchRequestEntry[] = events.map((event) => {
    return { Id: generateUniqueId(), Message: JSON.stringify({ event, eventType }) };
  });
  const params: SNS.Types.PublishBatchInput = {
    PublishBatchRequestEntries: entries,
    TopicArn: topicArn,
  };
  log.info({ events }, 'Sending events to sns...');
  const sns = initSNS();
  const response = await sns.publishBatch(params).promise();
  log.info({ response }, 'Events has been sent to sns !');
}

function initSNS() {
  if (SNS_CLIENT) return SNS_CLIENT;
  SNS_CLIENT = new SNS({ region: process.env.AWS_REGION ?? 'eu-west-3' });
  return SNS_CLIENT;
}
