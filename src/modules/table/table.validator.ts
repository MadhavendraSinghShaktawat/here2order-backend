import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BadRequestError } from '@/common/errors/bad-request-error';
import mongoose from 'mongoose';

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

export const validateRestaurantTableParams = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Validate restaurantId from params
    const { restaurantId } = req.params;
    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      throw new BadRequestError('Invalid restaurant ID format');
    }
    
    // For POST requests, validate the body
    if (req.method === 'POST') {
      const { tableNumber, capacity, isActive } = req.body;
      
      if (!tableNumber || typeof tableNumber !== 'string' || tableNumber.trim().length < 1) {
        throw new BadRequestError('Table number is required and must be a non-empty string');
      }
      
      if (!capacity || typeof capacity !== 'number' || capacity <= 0) {
        throw new BadRequestError('Capacity is required and must be a positive number');
      }
      
      if (isActive !== undefined && typeof isActive !== 'boolean') {
        throw new BadRequestError('isActive must be a boolean');
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
}; 