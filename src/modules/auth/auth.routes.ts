import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateSignup, validateLogin } from './auth.validator';

const router = Router();
const authController = new AuthController();

// TODO: Implement auth routes
router.post('/signup', validateSignup, (req, res, next) => authController.signup(req, res, next));
router.post('/login', validateLogin, (req, res, next) => authController.login(req, res, next));

export default router; 