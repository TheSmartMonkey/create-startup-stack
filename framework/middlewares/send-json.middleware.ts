import { formatHttpResponse } from '@helpers/helper';
import { logger } from '@helpers/logger';
import { Request, Response } from 'express';

export function sendJsonMiddleware(req: Request, res: Response): void {
  logger.info({ response: req.body });
  res.json(formatHttpResponse(req.body));
}
