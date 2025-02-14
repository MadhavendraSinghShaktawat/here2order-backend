import { IUser } from '@/modules/user/user.model';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Request {
      user?: IUser;
    }
  }
}

export {};
