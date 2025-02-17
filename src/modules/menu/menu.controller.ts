import { Response, NextFunction } from 'express';
import { MenuCategory } from './menu-category.model';
import { CreateMenuCategoryDto, MenuCategoryResponse } from './menu.types';
import { BadRequestError } from '@/common/errors/bad-request-error';
import { AuthenticatedRequest } from '@/middlewares/types/auth.types';

export class MenuController {
  constructor() {
    this.createCategory = this.createCategory.bind(this);
  }

  public async createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, isActive, sortOrder }: CreateMenuCategoryDto = req.body;
      const restaurantId = req.user.restaurantId;

      // Check if category already exists
      const existingCategory = await MenuCategory.findOne({
        name,
        restaurantId
      });

      if (existingCategory) {
        throw new BadRequestError('A category with this name already exists');
      }

      // Get highest sort order if not provided
      if (sortOrder === undefined) {
        const highestOrder = await MenuCategory.findOne({ restaurantId })
          .sort({ sortOrder: -1 })
          .select('sortOrder');
        
        const nextOrder = (highestOrder?.sortOrder ?? -1) + 1;
        req.body.sortOrder = nextOrder;
      }

      // Create category
      const category = await MenuCategory.create({
        ...req.body,
        restaurantId
      });

      const response: MenuCategoryResponse = {
        id: category._id.toString(),
        name: category.name,
        description: category.description,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        restaurantId: category.restaurantId.toString(),
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      };

      res.status(201).json({
        status: 'success',
        data: response
      });
    } catch (error) {
      next(error);
    }
  }
} 