import { Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@/modules/user/user.model';
import { CONSTANTS } from '@/config/constants';
import { UnauthorizedError } from '@/common/errors/unauthorized-error';
import { AuthenticatedRequest, JwtPayload } from './types/auth.types';

export const authenticate = (async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, CONSTANTS.JWT.SECRET) as JwtPayload;

    // Get user with Mongoose instance methods
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError('Invalid token');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
}) as RequestHandler; 