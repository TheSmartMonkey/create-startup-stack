import { UserDao } from '@db/user/user.dao';
import { logger } from '@helpers/logger';
import { HttpError } from '@models/global/error.model';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

export function requireAuthToken(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader: string = req?.headers?.authorization as string;
    if (!authHeader) throw new HttpError(401, 'TOKEN_IS_UNDEFINED');

    const token = authHeader.split(' ')[1];
    if (!token) throw new HttpError(401, 'TOKEN_IS_UNDEFINED');

    verify(token, process.env.JWT_TOKEN_SECRET ?? '', (error: any, user: UserDao) => {
      if (error) throw new HttpError(403, 'UNCORRECT_TOKEN_VERIFICATION_FAILED');
      req.body = { ...req.body, user };
      logger.info({ bodyRequireAuthTokenUser: req?.body });
      next();
    });
  } catch (error: any) {
    next({ statusCode: 403, message: 'REQUIRE_AUTH_TOKEN_ERROR', ...error });
  }
}
