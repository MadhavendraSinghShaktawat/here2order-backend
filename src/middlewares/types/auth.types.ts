import { Request } from 'express';
import { IUser } from '@/modules/user/user.model';

export interface AuthenticatedRequest extends Request {
  user: IUser;
}

export interface JwtPayload {
  userId: string;
  role: string;
  restaurantId?: string;
} 