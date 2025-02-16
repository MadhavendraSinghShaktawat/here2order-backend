import { Router, RequestHandler, Response, NextFunction } from 'express';
import { StaffController } from './staff.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validateStaffInvite, validateStaffUpdate } from './staff.validator';
import { AuthenticatedRequest } from '@/middlewares/types/auth.types';

const router = Router();
const staffController = new StaffController();

// Debug log
console.log('\n=== Staff Routes ===');

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
      console.log(`[Staff] Processing ${req.method} ${req.originalUrl}`);
      await handler(req as AuthenticatedRequest, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// Apply authentication middleware
console.log('Adding authentication middleware');
router.use(authenticate as RequestHandler);

// Staff routes
console.log('Registering routes:');

// Invite staff route
console.log('- POST /invite');
router.post(
  '/invite',
  validateStaffInvite as RequestHandler,
  handleRequest((req, res, next) => staffController.inviteStaff(req, res, next))
);

// Get staff route
console.log('- GET /');
router.get(
  '/',
  handleRequest((req, res, next) => staffController.getStaff(req, res, next))
);

// Update staff route
console.log('- PUT /:id');
router.put(
  '/:id',
  validateStaffUpdate as RequestHandler,
  handleRequest((req, res, next) => staffController.updateStaff(req, res, next))
);

// Delete staff route
console.log('- DELETE /:id');
router.delete('/:id', handleRequest((req, res, next) => staffController.deleteStaff(req, res, next)));

// Add this before exporting the router
router.get('/test', (req, res) => {
  res.json({ message: 'Staff router is working' });
});

// Debug: Print all registered routes on this router
console.log('\nStaff router stack:');
router.stack.forEach((layer: any) => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
    console.log(`${methods} ${layer.route.path}`);
  }
});

console.log('===================\n');

export default router; 