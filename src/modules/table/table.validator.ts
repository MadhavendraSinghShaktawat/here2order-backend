import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BadRequestError } from '@/common/errors/bad-request-error';

const createTableSchema = z.object({
  tableNumber: z.string().min(1).max(10),
  name: z.string().min(1).max(50),
  capacity: z.number().int().min(1).max(50)
});

const updateTableSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  capacity: z.number().int().min(1).max(50).optional(),
  isActive: z.boolean().optional()
});

export const validateCreateTable = (req: Request, res: Response, next: NextFunction): void => {
  try {
    createTableSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    next(error);
  }
};

export const validateUpdateTable = (req: Request, res: Response, next: NextFunction): void => {
  try {
    updateTableSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    next(error);
  }
}; 