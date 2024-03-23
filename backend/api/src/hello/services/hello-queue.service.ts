import { log } from '@helpers/logger';
import { Hello } from '@models/hello.model';
import { QueueServiceQueueEventType, SendSNSEvent } from '@models/queues/queue-service-events';
import { sendEventsToSNS } from '@queues/sns';
import { HelloDto } from '@src/hello/dtos/hello.dto';

export async function helloQueueService({ data }: { data: HelloDto }): Promise<Hello> {
  const message = data.message;
  log.info({ message }, 'hello message');
  const params: SendSNSEvent<any> = {
    events: [{ message }],
    topicArn: process.env.QUEUE_SERVICE_SNS_TOPIC_ARN,
    eventType: QueueServiceQueueEventType.HELLO_EVENT,
  };
  await sendEventsToSNS(params);
  return data;
}
