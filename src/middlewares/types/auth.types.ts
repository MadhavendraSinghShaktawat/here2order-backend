import { Request } from 'express';
import { Types } from 'mongoose';
import { IUser } from '@/modules/user/user.model';

export interface AuthenticatedRequest extends Request {
  user: IUser;
}

export interface JwtPayload {
  userId: string;
  role: string;
  restaurantId?: string;
  iat?: number;
  exp?: number;
} 