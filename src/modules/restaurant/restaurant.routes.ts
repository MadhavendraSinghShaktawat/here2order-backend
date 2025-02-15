import { Router, RequestHandler } from 'express';
import { RestaurantController } from './restaurant.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validateRestaurantUpdate } from './restaurant.validator';
import { AuthenticatedRequest } from '@/middlewares/types/auth.types';

const router = Router();
const restaurantController = new RestaurantController();

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

// Update restaurant route
router.put(
  '/:id',
  validateRestaurantUpdate,
  handleRequest((req, res, next) => restaurantController.updateRestaurant(req, res, next))
);

export default router; 