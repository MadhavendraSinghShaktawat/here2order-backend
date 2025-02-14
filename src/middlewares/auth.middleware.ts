import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@/modules/user/user.model';
import { CONSTANTS } from '@/config/constants';
import { UnauthorizedError } from '@/common/errors/unauthorized-error';
import { AuthenticatedRequest, JwtPayload } from './types/auth.types';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, CONSTANTS.JWT.SECRET) as JwtPayload;

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
}; 