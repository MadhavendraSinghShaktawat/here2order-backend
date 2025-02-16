import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BadRequestError } from '@/common/errors/bad-request-error';

const staffInviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().optional(),
  position: z.string().min(2)
});

const staffUpdateSchema = z.object({
  position: z.string().min(2).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  phone: z.string().optional()
});

export const validateStaffInvite = (req: Request, res: Response, next: NextFunction): void => {
  try {
    staffInviteSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    next(error);
  }
};

export const validateStaffUpdate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    staffUpdateSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    next(error);
  }
}; 