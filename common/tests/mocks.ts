import { Callback, Context, SQSEvent, SQSRecord } from 'aws-lambda';

export function generateValidatedSQSEvent(event: { records: SQSRecord[] }): SQSEvent {
  return {
    Records: event.records,
  } as SQSEvent;
}

export async function executeLambdaSQS(
  main: (event: SQSEvent, context: Context, callback: Callback) => Promise<any>,
  event: SQSEvent,
): Promise<any> {
  return await main(event, {} as Context, {} as Callback);
}
