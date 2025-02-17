import { Response, NextFunction, RequestHandler } from 'express';
import { ForbiddenError } from '@/common/errors/forbidden-error';
import { AuthenticatedRequest } from './types/auth.types';

export const authorize = (allowedRoles: string[]): RequestHandler => {
  return ((req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        throw new ForbiddenError('Not authorized to perform this action');
      }

      next();
    } catch (error) {
      next(error);
    }
  }) as RequestHandler;
}; 