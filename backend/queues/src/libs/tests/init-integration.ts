import { logger } from '@libs/utils/logger';
import * as dotenv from 'dotenv';

export function initIntegrationTests(): void {
  dotenv.config();
  logger.level = process.env.NO_LOGS === 'true' ? 'fatal' : 'debug';
  process.env.OFFLINE = 'true';
}
