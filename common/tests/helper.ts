import { log } from '@helpers/logger';
import * as dotenv from 'dotenv';
import * as sqs from './../../framework/queues/sqs';

export type InitUnitTestsMocks = {
  sendFailedEventsToDLQSpy: jest.SpyInstance;
};

export function initUnitTests(): void {
  dotenv.config();
  log.level = process.env.NO_LOGS === 'true' ? 'fatal' : 'debug';
}

export function initUnitTestsMocks(): InitUnitTestsMocks {
  process.env.JWT_TOKEN_SECRET = '1234';
  const sendFailedEventsToDLQSpy = jest.spyOn(sqs, 'sendFailedEventsToDLQ').mockImplementation(() => Promise.resolve());
  return { sendFailedEventsToDLQSpy };
}

export function initIntegrationTests(): void {
  dotenv.config();
  log.level = process.env.NO_LOGS === 'true' ? 'fatal' : 'debug';
  process.env.OFFLINE = 'true';
}
