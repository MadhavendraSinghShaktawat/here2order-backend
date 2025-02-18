import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BadRequestError } from '@/common/errors/bad-request-error';
import { isValidObjectId } from 'mongoose';

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
  tableId: z.string().refine(isValidObjectId, {
    message: 'Invalid table ID format'
  }),
  deviceId: z.string().min(1, 'Device ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format. Use E.164 format')
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

export const validateQrLogin = (req: Request, res: Response, next: NextFunction): void => {
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