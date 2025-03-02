import { Router, RequestHandler, Response, NextFunction, Request } from 'express';
import { MenuController } from './menu.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { authorize } from '@/middlewares/authorize.middleware';
import { 
  validateCreateMenuCategory, 
  validateCreateMenuItem, 
  validateUpdateMenuItem, 
  validateToggleItemAvailability,
  validateRestaurantCategoryParams
} from './menu.validator';
import { AuthenticatedRequest } from '@/middlewares/types/auth.types';
import express from 'express';
import { body, param } from 'express-validator';

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

// DEPRECATED: This route will be removed in future versions
// Use /categories/:restaurantId instead
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

// Add delete category route
router.delete(
  '/categories/:categoryId',
  authenticate as RequestHandler,
  authorize(['Restaurant_Admin']) as RequestHandler,
  handleRequest((req, res, next) => menuController.deleteCategory(req, res, next))
);

// Add create menu item route
router.post(
  '/items',
  authenticate as RequestHandler,
  authorize(['Restaurant_Admin']) as RequestHandler,
  validateCreateMenuItem,
  handleRequest((req, res, next) => menuController.createMenuItem(req, res, next))
);

// Add get menu items route
router.get(
  '/items/:restaurantId',
  authenticate as RequestHandler,
  authorize(['Restaurant_Admin', 'Staff', 'Customer']) as RequestHandler,
  handleRequest((req, res, next) => menuController.getMenuItems(req, res, next))
);

// Add update menu item route
router.put(
  '/items/:itemId',
  authenticate as RequestHandler,
  authorize(['Restaurant_Admin']) as RequestHandler,
  validateUpdateMenuItem,
  handleRequest((req, res, next) => menuController.updateMenuItem(req, res, next))
);

// Add delete menu item route
router.delete(
  '/items/:itemId',
  authenticate as RequestHandler,
  authorize(['Restaurant_Admin']) as RequestHandler,
  handleRequest((req, res, next) => menuController.deleteMenuItem(req, res, next))
);

// Add toggle item availability route
router.put(
  '/items/:itemId/availability',
  authenticate as RequestHandler,
  authorize(['Restaurant_Admin', 'Staff']) as RequestHandler,
  validateToggleItemAvailability,
  handleRequest((req, res, next) => menuController.toggleItemAvailability(req, res, next))
);

// NEW PREFERRED ROUTE: Create a new menu category for a specific restaurant
router.post(
  '/categories/:restaurantId',
  authenticate as RequestHandler,
  authorize(['Restaurant_Admin']) as RequestHandler,
  validateRestaurantCategoryParams,
  ((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.params.restaurantId) {
      req.body.restaurantId = req.params.restaurantId;
    }
    next();
  }) as RequestHandler,
  handleRequest((req, res, next) => menuController.createCategory(req, res, next))
);

// These routes are alternative formats and will remain for compatibility
router.post(
  '/restaurants/:restaurantId/categories',
  authenticate as RequestHandler,
  authorize(['Restaurant_Admin']) as RequestHandler,
  validateRestaurantCategoryParams,
  ((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.params.restaurantId) {
      req.body.restaurantId = req.params.restaurantId;
    }
    next();
  }) as RequestHandler,
  handleRequest((req, res, next) => menuController.createCategory(req, res, next))
);

// Get all categories for a specific restaurant
router.get(
  '/restaurants/:restaurantId/categories',
  authenticate as RequestHandler,
  validateRestaurantCategoryParams,
  handleRequest((req, res, next) => menuController.getCategories(req, res, next))
);

export default router; 