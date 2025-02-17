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

const staffLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  inviteToken: z.string().optional()
});

const staffRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  inviteToken: z.string(),
  phone: z.string().optional()
});

const qrLoginSchema = z.object({
  tableId: z.string().min(1),
  deviceId: z.string().min(1)
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

export const validateStaffLogin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    staffLoginSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    next(error);
  }
};

export const validateStaffRegister = (req: Request, res: Response, next: NextFunction): void => {
  try {
    staffRegisterSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    next(error);
  }
};

export const validateQRLogin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    qrLoginSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    next(error);
  }
}; 