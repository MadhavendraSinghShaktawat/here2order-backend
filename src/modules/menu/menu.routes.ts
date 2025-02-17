import { Router, RequestHandler, Response, NextFunction } from 'express';
import { MenuController } from './menu.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { authorize } from '@/middlewares/authorize.middleware';
import { validateCreateMenuCategory } from './menu.validator';
import { AuthenticatedRequest } from '@/middlewares/types/auth.types';

const router = Router();
const menuController = new MenuController();

// Create wrapper for type conversion
const handleRequest = (
  handler: (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => Promise<void>
): RequestHandler => {
  return async (req, res, next) => {
    try {
      await handler(req as AuthenticatedRequest, res, next);
    } catch (error) {
      next(error);
    }
  };
};

router.post(
  '/categories',
  authenticate as RequestHandler,
  authorize(['Restaurant_Admin']) as RequestHandler,
  validateCreateMenuCategory,
  handleRequest((req, res, next) => menuController.createCategory(req, res, next))
);

// Add get categories route
router.get(
  '/categories/:restaurantId',
  authenticate as RequestHandler,
  authorize(['Restaurant_Admin', 'Staff', 'Customer']) as RequestHandler,
  handleRequest((req, res, next) => menuController.getCategories(req, res, next))
);

export default router; 