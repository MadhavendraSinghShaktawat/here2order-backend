import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Restaurant } from './restaurant.model';
import { UpdateRestaurantDto } from './restaurant.types';
import { AuthenticatedRequest } from '@/middlewares/types/auth.types';
import { BadRequestError } from '@/common/errors/bad-request-error';
import { ForbiddenError } from '@/common/errors/forbidden-error';
import { NotFoundError } from '@/common/errors/not-found-error';

export class RestaurantController {
  constructor() {
    this.updateRestaurant = this.updateRestaurant.bind(this);
  }

  public async updateRestaurant(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateRestaurantDto = req.body;
      const currentUser = req.user;

      console.log('Update restaurant request:', {
        restaurantId: id,
        userId: currentUser._id,
        userRole: currentUser.role,
        userRestaurantId: currentUser.restaurantId
      });

      // Validate restaurant ID
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestError('Invalid restaurant ID');
      }

      // Find restaurant
      const restaurant = await Restaurant.findById(id);
      if (!restaurant) {
        throw new NotFoundError('Restaurant not found');
      }

      // Check authorization
      if (currentUser.role !== 'Restaurant_Admin' || 
          restaurant._id.toString() !== currentUser.restaurantId?.toString()) {
        throw new ForbiddenError('Not authorized to update this restaurant');
      }

      // Update allowed fields
      if (updateData.name) restaurant.name = updateData.name;
      if (updateData.address) restaurant.address = updateData.address;
      if (updateData.contact) restaurant.contact = updateData.contact;
      if (updateData.businessHours) restaurant.businessHours = updateData.businessHours;
      if (updateData.settings) restaurant.settings = {
        ...restaurant.settings,
        ...updateData.settings
      };

      // Save changes
      await restaurant.save();

      res.status(200).json({
        status: 'success',
        data: {
          id: restaurant._id,
          name: restaurant.name,
          address: restaurant.address,
          contact: restaurant.contact,
          businessHours: restaurant.businessHours,
          settings: restaurant.settings,
          isActive: restaurant.isActive,
          updatedAt: restaurant.updatedAt
        }
      });
    } catch (error) {
      next(error);
    }
  }
} 