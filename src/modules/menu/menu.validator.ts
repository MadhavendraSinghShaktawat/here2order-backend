import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BadRequestError } from '@/common/errors/bad-request-error';
import mongoose from 'mongoose';

// Add ObjectId validation helper first
const isValidObjectId = (value: string) => mongoose.Types.ObjectId.isValid(value);

const createMenuCategorySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional()
});

export const validateCreateMenuCategory = (req: Request, res: Response, next: NextFunction): void => {
  try {
    createMenuCategorySchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    next(error);
  }
};

const createMenuItemSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0),
  categoryId: z.string().refine(isValidObjectId, {
    message: 'Invalid category ID format'
  }),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  preparationTime: z.number().min(0).optional(),
  sortOrder: z.number().int().min(0).optional()
});

export const validateCreateMenuItem = (req: Request, res: Response, next: NextFunction): void => {
  try {
    createMenuItemSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    next(error);
  }
};

const updateMenuItemSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  price: z.number().min(0).optional(),
  categoryId: z.string().refine(isValidObjectId, {
    message: 'Invalid category ID format'
  }).optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  preparationTime: z.number().min(0).optional(),
  sortOrder: z.number().int().min(0).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

export const validateUpdateMenuItem = (req: Request, res: Response, next: NextFunction): void => {
  try {
    updateMenuItemSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    next(error);
  }
};

const toggleItemAvailabilitySchema = z.object({
  isAvailable: z.boolean({
    required_error: "isAvailable is required",
    invalid_type_error: "isAvailable must be a boolean"
  })
});

export const validateToggleItemAvailability = (req: Request, res: Response, next: NextFunction): void => {
  try {
    toggleItemAvailabilitySchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    next(error);
  }
};

// Add this new validator function
export const validateRestaurantCategoryParams = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Validate restaurantId from params
    const { restaurantId } = req.params;
    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      throw new BadRequestError('Invalid restaurant ID format');
    }
    
    // For POST requests, validate the body
    if (req.method === 'POST') {
      const { name, description, isActive } = req.body;
      
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        throw new BadRequestError('Category name is required and must be at least 2 characters');
      }
      
      if (description !== undefined && (typeof description !== 'string')) {
        throw new BadRequestError('Description must be a string');
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