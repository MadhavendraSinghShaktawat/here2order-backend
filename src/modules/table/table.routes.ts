import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { TableController } from './table.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validateCreateTable, validateUpdateTable } from './table.validator';
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

// Table routes
router.post(
  '/',
  validateCreateTable as RequestHandler,
  handleRequest((req, res, next) => tableController.createTable(req, res, next))
);

router.get(
  '/',
  handleRequest((req, res, next) => tableController.getTables(req, res, next))
);

router.get(
  '/:id',
  handleRequest((req, res, next) => tableController.getTable(req, res, next))
);

router.put(
  '/:id',
  validateUpdateTable as RequestHandler,
  handleRequest((req, res, next) => tableController.updateTable(req, res, next))
);

router.delete(
  '/:id',
  handleRequest((req, res, next) => tableController.deleteTable(req, res, next))
);

export default router; 