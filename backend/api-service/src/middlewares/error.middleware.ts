import { formatHttpResponse } from '@helpers/helper';
import { logger } from '@libs/logger';
import { NextFunction, Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandlerMiddleware(error: any, req: Request, res: Response, _next: NextFunction): void {
  logger.error(error);
  const statusCode = error?.statusCode ?? 500;
  const message = error?.message ?? 'UNKNOWN_ERROR';
  const response = formatHttpResponse({
    statusCode,
    body: {
      message,
      originalUrl: req.originalUrl,
      error,
    },
  });
  res.status(statusCode).json(response);
}
