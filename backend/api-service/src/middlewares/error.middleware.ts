import { formatHttpResponse } from '@helpers/helper';
import { logger } from '@helpers/logger';
import { NextFunction, Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandlerMiddleware(error: any, _req: Request, res: Response, _next: NextFunction): void {
  logger.error(error);
  const statusCode = error?.statusCode ?? 500;
  const message = error?.message ?? 'UNKNOWN_ERROR';
  const response = formatHttpResponse({
    statusCode,
    body: {
      message,
      error,
    },
  });
  res.status(statusCode).json(response);
}
