import { Router, RequestHandler } from 'express';
import { UserController } from './user.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { AuthenticatedRequest } from '@/middlewares/types/auth.types';

const router = Router();
const userController = new UserController();

// Create wrapper for type conversion
const handleRequest = (
  handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<void>
): RequestHandler => {
  return async (req, res, next) => {
    try {
      await handler(req as AuthenticatedRequest, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// Apply authentication middleware
router.use(authenticate as RequestHandler);

// Routes with proper method binding
router.get('/', handleRequest((req, res, next) => userController.getUsers(req, res, next)));
router.get('/:id', handleRequest((req, res, next) => userController.getUserById(req, res, next)));
router.put('/:id', handleRequest((req, res, next) => userController.updateUser(req, res, next)));

export default router; 