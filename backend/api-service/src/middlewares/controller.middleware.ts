import { NextFunction, Request, Response } from 'express';

export function controllerMiddleware<T>(callback: (data: T) => any) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: T = await callback(req.body);
      req.body = {
        statusCode: 200,
        body: {
          message: callback.name,
          data,
        },
      };
      next();
    } catch (error) {
      next(error);
    }
  };
}
