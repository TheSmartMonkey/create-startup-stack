import { MongoDbAdapter } from '@libs/adapter/mongodb.adapter';
import { MongooseAdapter } from '@libs/adapter/mongoose.adapter';
import { logger } from '@libs/utils/logger';
import { SqsUtils } from '@libs/utils/sqs';
import * as dotenv from 'dotenv';

export type InitUnitTestsSpies = {
  sendFailedEventsToDLQSpy: jest.SpyInstance;
};

export function initUnitTests(): void {
  dotenv.config();
  logger.level = process.env.NO_LOGS === 'true' ? 'fatal' : 'debug';
}

export function initUnitTestsSpies(): InitUnitTestsSpies {
  jest.spyOn(MongooseAdapter, 'connect').mockImplementation(() => Promise.resolve());
  jest.spyOn(MongoDbAdapter, 'connect').mockImplementation(() => Promise.resolve());
  const sendFailedEventsToDLQSpy = jest.spyOn(SqsUtils.prototype, 'sendFailedEventsToDLQ').mockImplementation(() => Promise.resolve());
  return { sendFailedEventsToDLQSpy };
}
