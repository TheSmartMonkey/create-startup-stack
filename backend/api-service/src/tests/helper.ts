import { logger } from '@helpers/logger';

export function initUnitTests(): void {
  logger.level = process.env.NO_LOGS === 'true' ? 'fatal' : 'debug';
}

export function initUnitTestsMocks(): void {
  process.env.JWT_TOKEN_SECRET = '1234';
}

export function initIntegrationTests(): void {
  logger.level = process.env.NO_LOGS === 'true' ? 'fatal' : 'debug';
  process.env.OFFLINE = 'true';
}
