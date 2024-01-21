import { logger } from '@libs/utils/logger';
import * as dotenv from 'dotenv';

export function initE2eTests(stageType?: string): void {
  dotenv.config();
  logger.level = process.env.NO_LOGS === 'true' ? 'fatal' : 'debug';
  process.env.AWS_STAGE = stageType ?? process.env.AWS_STAGE;
}
