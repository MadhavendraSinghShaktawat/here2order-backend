import { Response, NextFunction } from 'express';
import { MenuCategory } from './menu-category.model';
import { CreateMenuCategoryDto, MenuCategoryResponse, MenuCategoryListResponse } from './menu.types';
import { BadRequestError } from '@/common/errors/bad-request-error';
import { AuthenticatedRequest } from '@/middlewares/types/auth.types';
import { ForbiddenError } from '@/common/errors/forbidden-error';
import { NotFoundError } from '@/common/errors/not-found-error';
import { MenuItem } from './menu-item.model';
import { CreateMenuItemDto, MenuItemResponse, MenuItemListResponse, UpdateMenuItemDto, ToggleItemAvailabilityDto } from './menu.types';

export class MenuController {
  constructor() {
    this.createCategory = this.createCategory.bind(this);
    this.getCategories = this.getCategories.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
    this.createMenuItem = this.createMenuItem.bind(this);
    this.getMenuItems = this.getMenuItems.bind(this);
    this.updateMenuItem = this.updateMenuItem.bind(this);
    this.deleteMenuItem = this.deleteMenuItem.bind(this);
    this.toggleItemAvailability = this.toggleItemAvailability.bind(this);
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

  public async getCategories(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;

      // Add debug logging
      console.log('Get Categories Request:', {
        requestedRestaurantId: restaurantId,
        userRole: req.user.role,
        userRestaurantId: req.user.restaurantId?.toString()
      });

      // Validate restaurant access
      if (!req.user.canAccessRestaurant(restaurantId)) {
        throw new ForbiddenError(
          `Not authorized to access restaurant ${restaurantId}. User belongs to restaurant ${req.user.restaurantId?.toString()}`
        );
      }

      // Get all active categories for the restaurant
      const categories = await MenuCategory.find({
        restaurantId,
        ...(req.user.role === 'Customer' ? { isActive: true } : {})
      }).sort({ sortOrder: 1 });

      const response: MenuCategoryListResponse = {
        categories: categories.map(category => ({
          id: category._id.toString(),
          name: category.name,
          description: category.description,
          isActive: category.isActive,
          sortOrder: category.sortOrder,
          restaurantId: category.restaurantId.toString(),
          createdAt: category.createdAt,
          updatedAt: category.updatedAt
        }))
      };

      res.status(200).json({
        status: 'success',
        data: response
      });
    } catch (error) {
      next(error);
    }
  }

  public async deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId } = req.params;
      const userRestaurantId = req.user.restaurantId;

      // Find the category
      const category = await MenuCategory.findById(categoryId);
      if (!category) {
        throw new NotFoundError('Category not found');
      }

      // Verify restaurant ownership
      if (category.restaurantId.toString() !== userRestaurantId?.toString()) {
        throw new ForbiddenError('Not authorized to delete this category');
      }

      // Delete the category
      await MenuCategory.findByIdAndDelete(categoryId);

      res.status(200).json({
        status: 'success',
        data: {
          id: categoryId,
          message: 'Category deleted successfully'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public async createMenuItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        name, description, price, categoryId, 
        imageUrl, isActive, isAvailable, 
        preparationTime, sortOrder 
      }: CreateMenuItemDto = req.body;
      
      const restaurantId = req.user.restaurantId;

      // Verify category exists and belongs to restaurant
      const category = await MenuCategory.findOne({
        _id: categoryId,
        restaurantId
      });

      if (!category) {
        throw new BadRequestError('Invalid category');
      }

      // Check if item name already exists
      const existingItem = await MenuItem.findOne({
        name,
        restaurantId
      });

      if (existingItem) {
        throw new BadRequestError('An item with this name already exists');
      }

      // Get highest sort order if not provided
      if (sortOrder === undefined) {
        const highestOrder = await MenuItem.findOne({ 
          categoryId,
          restaurantId 
        })
          .sort({ sortOrder: -1 })
          .select('sortOrder');
        
        req.body.sortOrder = (highestOrder?.sortOrder ?? -1) + 1;
      }

      // Create menu item
      const menuItem = await MenuItem.create({
        ...req.body,
        restaurantId
      });

      const response: MenuItemResponse = {
        id: menuItem._id.toString(),
        name: menuItem.name,
        description: menuItem.description,
        price: menuItem.price,
        categoryId: menuItem.categoryId.toString(),
        restaurantId: menuItem.restaurantId.toString(),
        imageUrl: menuItem.imageUrl,
        isActive: menuItem.isActive,
        isAvailable: menuItem.isAvailable,
        preparationTime: menuItem.preparationTime,
        sortOrder: menuItem.sortOrder,
        createdAt: menuItem.createdAt,
        updatedAt: menuItem.updatedAt
      };

      res.status(201).json({
        status: 'success',
        data: response
      });
    } catch (error) {
      next(error);
    }
  }

  public async getMenuItems(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;

      // Validate restaurant access
      if (!req.user.canAccessRestaurant(restaurantId)) {
        throw new ForbiddenError(
          `Not authorized to access restaurant ${restaurantId}. User belongs to restaurant ${req.user.restaurantId?.toString()}`
        );
      }

      // Get all menu items for the restaurant
      const items = await MenuItem.find({
        restaurantId,
        ...(req.user.role === 'Customer' ? { isActive: true } : {})
      })
        .sort({ categoryId: 1, sortOrder: 1 })
        .populate('categoryId', 'name');

      const response: MenuItemListResponse = {
        items: items.map(item => ({
          id: item._id.toString(),
          name: item.name,
          description: item.description,
          price: item.price,
          categoryId: item.categoryId.toString(),
          restaurantId: item.restaurantId.toString(),
          imageUrl: item.imageUrl,
          isActive: item.isActive,
          isAvailable: item.isAvailable,
          preparationTime: item.preparationTime,
          sortOrder: item.sortOrder,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }))
      };

      res.status(200).json({
        status: 'success',
        data: response
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateMenuItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { itemId } = req.params;
      const updateData: UpdateMenuItemDto = req.body;
      const userRestaurantId = req.user.restaurantId;

      // Find the menu item
      const menuItem = await MenuItem.findById(itemId);
      if (!menuItem) {
        throw new NotFoundError('Menu item not found');
      }

      // Verify restaurant ownership
      if (menuItem.restaurantId.toString() !== userRestaurantId?.toString()) {
        throw new ForbiddenError('Not authorized to update this menu item');
      }

      // If category is being updated, verify it exists and belongs to restaurant
      if (updateData.categoryId) {
        const category = await MenuCategory.findOne({
          _id: updateData.categoryId,
          restaurantId: userRestaurantId
        });

        if (!category) {
          throw new BadRequestError('Invalid category');
        }
      }

      // If name is being updated, check for duplicates
      if (updateData.name && updateData.name !== menuItem.name) {
        const existingItem = await MenuItem.findOne({
          name: updateData.name,
          restaurantId: userRestaurantId,
          _id: { $ne: itemId }
        });

        if (existingItem) {
          throw new BadRequestError('An item with this name already exists');
        }
      }

      // Update the menu item
      const updatedItem = await MenuItem.findByIdAndUpdate(
        itemId,
        { $set: updateData },
        { new: true }
      );

      if (!updatedItem) {
        throw new NotFoundError('Menu item not found');
      }

      const response: MenuItemResponse = {
        id: updatedItem._id.toString(),
        name: updatedItem.name,
        description: updatedItem.description,
        price: updatedItem.price,
        categoryId: updatedItem.categoryId.toString(),
        restaurantId: updatedItem.restaurantId.toString(),
        imageUrl: updatedItem.imageUrl,
        isActive: updatedItem.isActive,
        isAvailable: updatedItem.isAvailable,
        preparationTime: updatedItem.preparationTime,
        sortOrder: updatedItem.sortOrder,
        createdAt: updatedItem.createdAt,
        updatedAt: updatedItem.updatedAt
      };

      res.status(200).json({
        status: 'success',
        data: response
      });
    } catch (error) {
      next(error);
    }
  }

  public async deleteMenuItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { itemId } = req.params;
      const userRestaurantId = req.user.restaurantId;

      // Find the menu item
      const menuItem = await MenuItem.findById(itemId);
      if (!menuItem) {
        throw new NotFoundError('Menu item not found');
      }

      // Verify restaurant ownership
      if (menuItem.restaurantId.toString() !== userRestaurantId?.toString()) {
        throw new ForbiddenError('Not authorized to delete this menu item');
      }

      // Delete the menu item
      await MenuItem.findByIdAndDelete(itemId);

      res.status(200).json({
        status: 'success',
        data: {
          id: itemId,
          message: 'Menu item deleted successfully'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public async toggleItemAvailability(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { itemId } = req.params;
      const { isAvailable }: ToggleItemAvailabilityDto = req.body;
      const userRestaurantId = req.user.restaurantId;

      // Find the menu item
      const menuItem = await MenuItem.findById(itemId);
      if (!menuItem) {
        throw new NotFoundError('Menu item not found');
      }

      // Verify restaurant ownership
      if (menuItem.restaurantId.toString() !== userRestaurantId?.toString()) {
        throw new ForbiddenError('Not authorized to update this menu item');
      }

      // Update availability
      const updatedItem = await MenuItem.findByIdAndUpdate(
        itemId,
        { $set: { isAvailable } },
        { new: true }
      );

      if (!updatedItem) {
        throw new NotFoundError('Menu item not found');
      }

      const response: MenuItemResponse = {
        id: updatedItem._id.toString(),
        name: updatedItem.name,
        description: updatedItem.description,
        price: updatedItem.price,
        categoryId: updatedItem.categoryId.toString(),
        restaurantId: updatedItem.restaurantId.toString(),
        imageUrl: updatedItem.imageUrl,
        isActive: updatedItem.isActive,
        isAvailable: updatedItem.isAvailable,
        preparationTime: updatedItem.preparationTime,
        sortOrder: updatedItem.sortOrder,
        createdAt: updatedItem.createdAt,
        updatedAt: updatedItem.updatedAt
      };

      res.status(200).json({
        status: 'success',
        data: response
      });
    } catch (error) {
      next(error);
    }
  }
} 