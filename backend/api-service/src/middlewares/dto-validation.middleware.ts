import { logger } from '@helpers/logger';
import { validateOrReject } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

export function dtoValidationMiddleware<T>(type: new () => T) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // Concatenate data
      req.body = { ...req.params, ...req.body, ...req.query };
      logger.info({ bodyDtoValidation: req?.body });

      // Validate data
      const objectToValidate = new type();
      Object.assign(objectToValidate as object, req.body);
      await validateOrReject(objectToValidate as any);
      next();
    } catch (error: any) {
      next({ ...error, statusCode: 400, message: 'DTO_VALIDATION_ERROR' });
    }
  };
}
