import { Router, RequestHandler, Response, NextFunction } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validateSignup, validateLogin, validateStaffLogin, validateStaffRegister, validateQRLogin } from './auth.validator';
import { AuthenticatedRequest } from '@/middlewares/types/auth.types';

const router = Router();
const authController = new AuthController();

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

// TODO: Implement auth routes
router.post('/signup', validateSignup, (req, res, next) => authController.signup(req, res, next));
router.post('/login', validateLogin, (req, res, next) => authController.login(req, res, next));
router.post('/staff/login', validateStaffLogin, (req, res, next) => 
  authController.staffLogin(req, res, next)
);
router.post(
  '/staff-register',
  validateStaffRegister,
  (req, res, next) => authController.staffRegister(req, res, next)
);

// Add logout route with proper type handling
router.post(
  '/logout', 
  authenticate as RequestHandler,
  handleRequest((req, res, next) => authController.logout(req, res, next))
);

// Add current user route
router.get(
  '/me',
  authenticate as RequestHandler,
  handleRequest((req, res, next) => authController.getCurrentUser(req, res, next))
);

// Add QR login route
router.post(
  '/qr-login',
  validateQRLogin,
  (req, res, next) => authController.qrLogin(req, res, next)
);

export default router; 