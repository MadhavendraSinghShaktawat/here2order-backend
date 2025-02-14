import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { User, IUser } from './user.model';
import { CreateUserDto, UpdateUserDto, UserResponse } from './user.types';
import { BadRequestError } from '../../common/errors/bad-request-error';
import { NotFoundError } from '../../common/errors/not-found-error';
import { ForbiddenError } from '../../common/errors/forbidden-error';
import { AuthenticatedRequest } from '../../middlewares/types/auth.types';

export class UserController {
  constructor() {
    // Bind methods to instance
    this.getUsers = this.getUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.updateUser = this.updateUser.bind(this);
  }

  public async getUsers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { role, restaurantId } = req.query;
      const currentUser = req.user;

      if (!currentUser) {
        throw new ForbiddenError('Authentication required');
      }

      const query: Record<string, any> = {};
      
      // Role-based filtering
      if (currentUser.role !== 'SuperAdmin') {
        if (currentUser.role === 'Restaurant_Admin') {
          query.restaurantId = currentUser.restaurantId;
        } else {
          throw new ForbiddenError('Not authorized to access user list');
        }
      }

      if (role) query.role = role;
      if (restaurantId && Types.ObjectId.isValid(restaurantId.toString())) {
        query.restaurantId = new Types.ObjectId(restaurantId.toString());
      }

      const users = await User.find(query)
        .select('-__v')
        .sort({ createdAt: -1 });

      const response: UserResponse[] = users.map((user: IUser) => ({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        restaurantId: user.restaurantId?.toString(),
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));

      res.status(200).json({
        status: 'success',
        data: response
      });
    } catch (error) {
      next(error);
    }
  }

  public async createUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userData: CreateUserDto = req.body;
      const currentUser = req.user;

      if (!currentUser) {
        throw new ForbiddenError('Authentication required');
      }

      // Role-based creation restrictions
      if (currentUser.role !== 'SuperAdmin') {
        if (currentUser.role === 'Restaurant_Admin') {
          if (!['Staff', 'Customer'].includes(userData.role)) {
            throw new ForbiddenError('Restaurant Admin can only create Staff and Customer accounts');
          }
          userData.restaurantId = currentUser.restaurantId?.toString();
        } else {
          throw new ForbiddenError('Not authorized to create users');
        }
      }

      // Convert restaurantId string to ObjectId if provided
      if (userData.restaurantId && Types.ObjectId.isValid(userData.restaurantId)) {
        const user = new User({
          ...userData,
          restaurantId: new Types.ObjectId(userData.restaurantId)
        }) as IUser;
        
        await user.save();

        res.status(201).json({
          status: 'success',
          data: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            restaurantId: user.restaurantId?.toString(),
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        });
      } else {
        throw new BadRequestError('Invalid restaurant ID');
      }
    } catch (error) {
      next(error);
    }
  }

  public async updateUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateUserDto = req.body;
      const currentUser = req.user;

      if (!currentUser) {
        throw new ForbiddenError('Authentication required');
      }

      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestError('Invalid user ID');
      }

      const user = await User.findById(id) as IUser | null;
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Role-based update restrictions
      if (currentUser.role !== 'SuperAdmin') {
        if (currentUser.role === 'Restaurant_Admin') {
          if (user.restaurantId?.toString() !== currentUser.restaurantId?.toString()) {
            throw new ForbiddenError('Can only update users from your restaurant');
          }
          if (!['Staff', 'Customer'].includes(user.role)) {
            throw new ForbiddenError('Can only update Staff and Customer accounts');
          }
        } else {
          throw new ForbiddenError('Not authorized to update users');
        }
      }

      Object.assign(user, updateData);
      await user.save();

      res.status(200).json({
        status: 'success',
        data: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          restaurantId: user.restaurantId?.toString(),
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public async getUserById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await User.findById(req.params.id).select('-__v');
      if (!user) {
        res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
        return;
      }
      res.status(200).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
} 