import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import crypto from 'crypto';
import { StaffInvite } from './staff.model';
import { User } from '../user/user.model';
import { Restaurant } from '../restaurant/restaurant.model';
import { StaffInviteDto, StaffResponse, IStaffInvite } from './staff.types';
import { AuthenticatedRequest } from '@/middlewares/types/auth.types';
import { BadRequestError } from '@/common/errors/bad-request-error';
import { ForbiddenError } from '@/common/errors/forbidden-error';
import { sendStaffInviteEmail } from '@/services/email.service';

export class StaffController {
  constructor() {
    this.inviteStaff = this.inviteStaff.bind(this);
    this.getStaff = this.getStaff.bind(this);
  }

  public async inviteStaff(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, name, phone, position }: StaffInviteDto = req.body;
      const currentUser = req.user;

      if (!currentUser.restaurantId) {
        throw new ForbiddenError('Restaurant ID is required');
      }

      // Get restaurant details
      const restaurant = await Restaurant.findById(currentUser.restaurantId);
      if (!restaurant) {
        throw new BadRequestError('Restaurant not found');
      }

      // Check if user has permission
      if (!['Restaurant_Admin'].includes(currentUser.role)) {
        throw new ForbiddenError('Not authorized to invite staff');
      }

      // Check if staff already exists
      const existingStaff = await StaffInvite.findOne({
        email,
        restaurantId: currentUser.restaurantId
      });

      if (existingStaff) {
        throw new BadRequestError('Staff member already invited');
      }

      // Generate invite token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48); // Token expires in 48 hours

      // Create staff invite
      const staffInvite = await StaffInvite.create({
        email,
        name,
        phone,
        position,
        restaurantId: currentUser.restaurantId,
        invitedBy: currentUser._id,
        token,
        expiresAt,
        status: 'Pending' as const
      });

      // Send invitation email
      await sendStaffInviteEmail({
        email,
        name,
        token,
        restaurantName: restaurant.name
      });

      const response: StaffResponse = {
        id: staffInvite._id.toString(),
        email: staffInvite.email,
        name: staffInvite.name,
        phone: staffInvite.phone,
        position: staffInvite.position,
        restaurantId: staffInvite.restaurantId.toString(),
        status: staffInvite.status,
        invitedBy: staffInvite.invitedBy.toString(),
        invitedAt: staffInvite.invitedAt,
        joinedAt: staffInvite.joinedAt
      };

      res.status(201).json({
        status: 'success',
        data: response
      });
    } catch (error) {
      next(error);
    }
  }

  public async getStaff(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user;

      if (!currentUser.restaurantId) {
        throw new ForbiddenError('Restaurant ID is required');
      }

      // Check if user has permission
      if (!['Restaurant_Admin'].includes(currentUser.role)) {
        throw new ForbiddenError('Not authorized to view staff');
      }

      // Get all staff invites for the restaurant
      const staffInvites = await StaffInvite.find({
        restaurantId: currentUser.restaurantId
      }).sort({ createdAt: -1 });

      // Get all staff users for the restaurant
      const staffUsers = await User.find({
        restaurantId: currentUser.restaurantId,
        role: 'Staff'
      }).sort({ createdAt: -1 });

      const response: StaffResponse[] = [
        ...staffInvites.map(invite => ({
          id: invite._id.toString(),
          email: invite.email,
          name: invite.name,
          phone: invite.phone,
          position: invite.position,
          restaurantId: invite.restaurantId.toString(),
          status: invite.status,
          invitedBy: invite.invitedBy.toString(),
          invitedAt: invite.invitedAt,
          joinedAt: invite.joinedAt
        })),
        ...staffUsers.map(user => ({
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          phone: user.phone,
          position: 'Staff',
          restaurantId: user.restaurantId!.toString(),
          status: 'Active' as const,
          invitedBy: '',
          invitedAt: user.createdAt,
          joinedAt: user.createdAt
        }))
      ];

      res.status(200).json({
        status: 'success',
        data: response
      });
    } catch (error) {
      next(error);
    }
  }
} 