import {
  APIGatewayEventRequestContextWithAuthorizer,
  APIGatewayProxyEvent,
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyResult,
  Callback,
  Context,
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

export async function executeLambda(
  main: (event: Partial<APIGatewayProxyEvent>, context: Context, callback: Callback) => Promise<APIGatewayProxyResult>,
  event: Partial<APIGatewayProxyEvent>,
): Promise<APIGatewayProxyResult> {
  return (await main(event, {} as Context, {} as Callback)) as APIGatewayProxyResult;
}
