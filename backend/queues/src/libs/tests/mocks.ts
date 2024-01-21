import { WebhookDuplicatesDb } from '@libs/db/webhook-duplicates/webhook-duplicates.db';
import { Mailgun } from '@models/mailgun/mailgun.model';
import {
  APIGatewayEventRequestContextWithAuthorizer,
  APIGatewayProxyEvent,
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyResult,
  Callback,
  Context,
  SQSEvent,
  SQSRecord,
} from 'aws-lambda';

export const requestContext = {
  authorizer: {
    claims: {
      email: 'test-app@dev.app.com',
      sub: 'a83c6422-2d34-4366-84f9-d3a4a336d61d',
    },
  },
};

export function generateValidatedAPIGatewayProxyEvent(event: {
  body?: string;
  pathParameters?: APIGatewayProxyEventPathParameters;
  queryStringParameters?: APIGatewayProxyEventQueryStringParameters;
  claims?: { email: string; sub: string };
}): Partial<APIGatewayProxyEvent> {
  return {
    headers: {},
    requestContext: {
      authorizer: {
        claims: event.claims ?? requestContext.authorizer.claims,
      },
    } as APIGatewayEventRequestContextWithAuthorizer<unknown>,
    pathParameters: event.pathParameters,
    queryStringParameters: event.queryStringParameters,
    body: event.body,
  } as Partial<APIGatewayProxyEvent>;
}

export function generateValidatedSQSEvent(event: { records: SQSRecord[] }): SQSEvent {
  return {
    Records: event.records,
  } as SQSEvent;
}

export async function executeLambda(
  main: (event: Partial<APIGatewayProxyEvent>, context: Context, callback: Callback) => Promise<APIGatewayProxyResult>,
  event: Partial<APIGatewayProxyEvent>,
): Promise<APIGatewayProxyResult> {
  return (await main(event, {} as Context, {} as Callback)) as APIGatewayProxyResult;
}

export async function executeLambdaSQS(
  main: (event: SQSEvent, context: Context, callback: Callback) => Promise<any>,
  event: SQSEvent,
): Promise<any> {
  return await main(event, {} as Context, {} as Callback);
}

export function mockGetDuplicatesAndNoneDuplicates(
  records: SQSRecord[],
  { duplicates, noneDuplicates }: { duplicates?: Mailgun[]; noneDuplicates?: Mailgun[] },
): jest.SpyInstance {
  return jest.spyOn(WebhookDuplicatesDb.prototype, 'getDuplicatesAndNoneDuplicates').mockImplementation(() =>
    Promise.resolve({
      duplicates: new WebhookDuplicatesDb().mailgunEventsToDao(duplicates ?? [], records, {} as Context),
      noneDuplicates: new WebhookDuplicatesDb().mailgunEventsToDao(noneDuplicates ?? [], records, {} as Context),
    }),
  );
}
