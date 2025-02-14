import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BadRequestError } from '@/common/errors/bad-request-error';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string(),
  restaurant: z.object({
    name: z.string().min(2),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(),
      country: z.string()
    }),
    contact: z.object({
      phone: z.string(),
      email: z.string().email()
    })
  })
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const validateSignup = (req: Request, res: Response, next: NextFunction): void => {
  try {
    signupSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
}; 