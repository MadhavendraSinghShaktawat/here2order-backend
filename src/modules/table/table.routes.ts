import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { TableController } from './table.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { authorize } from '@/middlewares/authorize.middleware';
import { validateCreateTable, validateUpdateTable, validateRestaurantTableParams } from './table.validator';
import { AuthenticatedRequest } from '@/middlewares/types/auth.types';

const router = Router();
const tableController = new TableController();

// Create wrapper for type conversion
const handleRequest = (
  handler: (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => Promise<void>
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req as AuthenticatedRequest, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// Apply authentication middleware
router.use(authenticate as RequestHandler);

// DEPRECATED: This route will be removed in future versions
// Use /table/:restaurantId instead
router.post(
  '/',
  authenticate as RequestHandler,
  authorize(['Restaurant_Admin']) as RequestHandler,
  validateCreateTable,
  handleRequest((req, res, next) => tableController.createTable(req, res, next))
);

// NEW PREFERRED ROUTE: Create a new table for a specific restaurant
router.post(
  '/:restaurantId',
  authenticate as RequestHandler,
  authorize(['Restaurant_Admin']) as RequestHandler,
  validateRestaurantTableParams,
  ((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.params.restaurantId) {
      req.body.restaurantId = req.params.restaurantId;
    }
    next();
  }) as RequestHandler,
  handleRequest((req, res, next) => tableController.createTable(req, res, next))
);

// Get all tables for a specific restaurant
router.get(
  '/:restaurantId',
  authenticate as RequestHandler,
  authorize(['Restaurant_Admin', 'Staff']) as RequestHandler,
  handleRequest((req, res, next) => tableController.getTables(req, res, next))
);

router.get(
  '/',
  handleRequest((req, res, next) => tableController.getTables(req, res, next))
);

router.get(
  '/:id',
  handleRequest((req, res, next) => tableController.getTable(req, res, next))
);

// Update a table
router.put(
  '/:tableId',
  authenticate as RequestHandler,
  authorize(['Restaurant_Admin']) as RequestHandler,
  validateUpdateTable,
  handleRequest((req, res, next) => tableController.updateTable(req, res, next))
);

// Delete a table
router.delete(
  '/:tableId',
  authenticate as RequestHandler,
  authorize(['Restaurant_Admin']) as RequestHandler,
  handleRequest((req, res, next) => tableController.deleteTable(req, res, next))
);

export default router; 