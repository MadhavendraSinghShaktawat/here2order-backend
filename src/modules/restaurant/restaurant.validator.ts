import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BadRequestError } from '@/common/errors/bad-request-error';

const businessHourSchema = z.object({
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isClosed: z.boolean()
});

const restaurantUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string()
  }).optional(),
  contact: z.object({
    phone: z.string(),
    email: z.string().email()
  }).optional(),
  businessHours: z.array(businessHourSchema).length(7).optional(),
  settings: z.object({
    currency: z.string().optional(),
    language: z.string().optional(),
    timezone: z.string().optional(),
    tableCount: z.number().min(0).optional()
  }).optional()
});

export const validateRestaurantUpdate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    restaurantUpdateSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(error.errors[0].message);
    }
    next(error);
  }
}; 