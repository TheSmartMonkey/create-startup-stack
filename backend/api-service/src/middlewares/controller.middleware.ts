import { UserDao } from '@db/user/user.dao';
import { NextFunction, Request, Response } from 'express';

export function controllerMiddleware<T>(callback: (data: T, user?: UserDao) => any) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.body?.user;
      if (user) delete req.body.user;
      const data: T = await callback(req.body, user);
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
