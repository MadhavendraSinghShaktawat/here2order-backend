import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateSignup, validateLogin, validateStaffLogin } from './auth.validator';

const router = Router();
const authController = new AuthController();

// TODO: Implement auth routes
router.post('/signup', validateSignup, (req, res, next) => authController.signup(req, res, next));
router.post('/login', validateLogin, (req, res, next) => authController.login(req, res, next));
router.post('/staff/login', validateStaffLogin, (req, res, next) => 
  authController.staffLogin(req, res, next)
);

export default router; 