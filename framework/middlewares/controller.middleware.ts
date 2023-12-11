import { UserDao } from '@db/user/user.dao';
import { Context } from 'aws-lambda';
import { NextFunction, Request, Response } from 'express';

export function controller<T>(callback: ({ data, user, context }: { data?: T; user?: UserDao; context?: Context }) => any) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.body?.user;
      if (user) delete req.body.user;
      const data: T = await callback({ data: req.body, user, context: (req as any).context as Context });
      req.body = {
        statusCode: 200,
        body: {
          message: callback.name,
          originalUrl: req.originalUrl,
          data,
        },
      };
      next();
    } catch (error) {
      next(error);
    }
  };
}
