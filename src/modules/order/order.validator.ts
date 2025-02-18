import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BadRequestError } from '@/common/errors/bad-request-error';
import mongoose from 'mongoose';

const isValidObjectId = (value: string) => mongoose.Types.ObjectId.isValid(value);

const orderItemSchema = z.object({
  menuItemId: z.string().refine(isValidObjectId, {
    message: 'Invalid menu item ID format'
  }),
  quantity: z.number().int().min(1),
  notes: z.string().max(200).optional()
});

const createOrderSchema = z.object({
  tableId: z.string().refine(isValidObjectId, {
    message: 'Invalid table ID format'
  }),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  specialInstructions: z.string().max(500).optional()
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'], {
    required_error: "Status is required",
    invalid_type_error: "Invalid status value"
  })
});

export const validateCreateOrder = (req: Request, res: Response, next: NextFunction): void => {
  try {
    createOrderSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    next(error);
  }
};

export const validateUpdateOrderStatus = (req: Request, res: Response, next: NextFunction): void => {
  try {
    updateOrderStatusSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    next(error);
  }
}; 