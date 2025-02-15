import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../user/user.model';
import { Restaurant } from '../restaurant/restaurant.model';
import { SignupDto, LoginDto, AuthResponse } from './auth.types';
import { BadRequestError } from '@/common/errors/bad-request-error';
import { NotFoundError } from '@/common/errors/not-found-error';
import { CONSTANTS } from '@/config/constants';

interface TokenPayload {
  userId: Types.ObjectId;
  role: string;
  restaurantId?: Types.ObjectId;
}

export class AuthController {
  constructor() {
    // Bind methods to instance
    this.generateToken = this.generateToken.bind(this);
    this.signup = this.signup.bind(this);
    this.login = this.login.bind(this);
  }

  private generateToken(payload: TokenPayload): string {
    try {
      return jwt.sign(
        {
          userId: payload.userId.toString(),
          role: payload.role,
          restaurantId: payload.restaurantId?.toString()
        },
        CONSTANTS.JWT.SECRET,
        { expiresIn: CONSTANTS.JWT.EXPIRES_IN }
      );
    } catch (error) {
      console.error('Token generation error:', error);
      throw error;
    }
  }

  public async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('Signup request received:', req.body);

      const signupData: SignupDto = req.body;

      // Validate required fields
      if (!signupData.email || !signupData.password || !signupData.name || !signupData.restaurant) {
        throw new BadRequestError('Missing required fields');
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: signupData.email });
      if (existingUser) {
        throw new BadRequestError('Email already registered');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(signupData.password, 10);

      // Create user and restaurant in a transaction
      const session = await User.startSession();
      let user;
      let restaurant;

      try {
        session.startTransaction();

        // Create restaurant first (without adminId)
        restaurant = await Restaurant.create([{
          name: signupData.restaurant.name,
          address: signupData.restaurant.address,
          contact: signupData.restaurant.contact,
          businessHours: [
            { day: 'Monday', open: '09:00', close: '17:00', isClosed: false },
            { day: 'Tuesday', open: '09:00', close: '17:00', isClosed: false },
            { day: 'Wednesday', open: '09:00', close: '17:00', isClosed: false },
            { day: 'Thursday', open: '09:00', close: '17:00', isClosed: false },
            { day: 'Friday', open: '09:00', close: '17:00', isClosed: false },
            { day: 'Saturday', open: '09:00', close: '17:00', isClosed: false },
            { day: 'Sunday', open: '09:00', close: '17:00', isClosed: true }
          ],
          isActive: true
        }], { session });

        // Create user with restaurantId
        user = await User.create([{
          email: signupData.email,
          password: hashedPassword,
          name: signupData.name,
          role: 'Restaurant_Admin',
          phone: signupData.phone,
          restaurantId: restaurant[0]._id,
          isActive: true
        }], { session });

        // Update restaurant with adminId
        restaurant[0].adminId = user[0]._id;
        await restaurant[0].save({ session });

        await session.commitTransaction();
      } catch (error) {
        console.error('Transaction error:', error);
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }

      // Generate JWT token
      const token = this.generateToken({
        userId: user[0]._id,
        role: user[0].role,
        restaurantId: restaurant[0]._id
      });

      const response: AuthResponse = {
        user: {
          id: user[0]._id.toString(),
          email: user[0].email,
          name: user[0].name,
          role: user[0].role,
          restaurantId: restaurant[0]._id.toString()
        },
        token
      };

      res.status(201).json({
        status: 'success',
        data: response
      });
    } catch (error) {
      console.error('Signup error:', error);
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('Login request received:', { email: req.body.email });
      const { email, password }: LoginDto = req.body;

      // Find user with password field
      const user = await User.findOne({ email }).select('+password');
      console.log('User found:', user ? 'Yes' : 'No');

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new BadRequestError('Invalid credentials');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = this.generateToken({ 
        userId: user._id,
        role: user.role,
        restaurantId: user.restaurantId
      });

      const response: AuthResponse = {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          restaurantId: user.restaurantId?.toString() || ''
        },
        token
      };

      res.status(200).json({
        status: 'success',
        data: response
      });
    } catch (error) {
      console.error('Login error:', error);
      next(error);
    }
  }
} 