import { formatHttpResponse } from '@helpers/helper';
import { log } from '@helpers/logger';
import { Request, Response } from 'express';

export function sendJsonMiddleware(req: Request, res: Response): void {
  log.info({ response: req.body });
  res.json(formatHttpResponse(req.body));
}
