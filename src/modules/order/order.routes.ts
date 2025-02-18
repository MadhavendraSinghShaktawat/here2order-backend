import { Router, RequestHandler, Response, NextFunction } from 'express';
import { OrderController } from './order.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { authorize } from '@/middlewares/authorize.middleware';
import { validateCreateOrder, validateUpdateOrderStatus } from './order.validator';
import { AuthenticatedRequest } from '@/middlewares/types/auth.types';

const router = Router();
const orderController = new OrderController();

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

// Get restaurant orders - This needs to come BEFORE the /:id route
router.get(
  '/restaurant/:restaurantId',
  authenticate as RequestHandler,
  authorize(['Restaurant_Admin', 'Staff']) as RequestHandler,
  handleRequest((req, res, next) => orderController.getRestaurantOrders(req, res, next))
);

// Get table orders - Add this after restaurant orders but before /:id
router.get(
  '/table/:tableId',
  authenticate as RequestHandler,
  authorize(['Customer', 'Staff', 'Restaurant_Admin']) as RequestHandler,
  handleRequest((req, res, next) => orderController.getTableOrders(req, res, next))
);

// Create new order
router.post(
  '/',
  authenticate as RequestHandler,
  authorize(['Customer']) as RequestHandler,
  validateCreateOrder,
  handleRequest((req, res, next) => orderController.createOrder(req, res, next))
);

// Get order details
router.get(
  '/:id',
  authenticate as RequestHandler,
  authorize(['Customer', 'Staff', 'Restaurant_Admin']) as RequestHandler,
  handleRequest((req, res, next) => orderController.getOrderDetails(req, res, next))
);

// Update order status
router.put(
  '/:orderId/status',
  authenticate as RequestHandler,
  authorize(['Restaurant_Admin', 'Staff']) as RequestHandler,
  validateUpdateOrderStatus,
  handleRequest((req, res, next) => orderController.updateOrderStatus(req, res, next))
);

// Add this route with the other order routes
router.delete(
  '/:orderId',
  authenticate as RequestHandler,
  authorize(['Restaurant_Admin', 'Staff', 'Customer']) as RequestHandler,
  handleRequest((req, res, next) => orderController.deleteOrder(req, res, next))
);

export default router; 