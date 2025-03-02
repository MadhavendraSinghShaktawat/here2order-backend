import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import crypto from 'crypto';
import { StaffInvitation, InviteStatus } from '../staff-invitation/staff-invitation.model';
import { User } from '../user/user.model';
import { Restaurant } from '../restaurant/restaurant.model';
import { StaffInviteDto, StaffResponse, IStaffInvite, UpdateStaffDto } from './staff.types';
import { AuthenticatedRequest } from '@/middlewares/types/auth.types';
import { BadRequestError } from '@/common/errors/bad-request-error';
import { ForbiddenError } from '@/common/errors/forbidden-error';
import { sendStaffInviteEmail } from '@/services/email.service';
import { NotFoundError } from '@/common/errors/not-found-error';
import mongoose from 'mongoose';

export class StaffController {
  constructor() {
    this.inviteStaff = this.inviteStaff.bind(this);
    this.getStaff = this.getStaff.bind(this);
    this.updateStaff = this.updateStaff.bind(this);
    this.deleteStaff = this.deleteStaff.bind(this);
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
      const existingStaff = await StaffInvitation.findOne({
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
      const staffInvite = await StaffInvitation.create({
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

      const response: StaffResponse & { token: string; expiresAt: Date } = {
        id: staffInvite._id.toString(),
        email: staffInvite.email,
        name: staffInvite.name,
        phone: staffInvite.phone,
        position: staffInvite.position,
        restaurantId: staffInvite.restaurantId.toString(),
        status: staffInvite.status,
        invitedBy: staffInvite.invitedBy.toString(),
        invitedAt: staffInvite.invitedAt,
        joinedAt: staffInvite.joinedAt,
        token: staffInvite.token,
        expiresAt: staffInvite.expiresAt
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
      const staffInvites = await StaffInvitation.find({
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
          status: user.isActive ? 'Active' as InviteStatus : 'Inactive' as InviteStatus,
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

  public async updateStaff(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateStaffDto = req.body;
      const currentUser = req.user;

      // Validate ID
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestError('Invalid staff ID');
      }

      // Check authorization
      if (!currentUser.restaurantId) {
        throw new ForbiddenError('Restaurant ID is required');
      }

      if (!['Restaurant_Admin'].includes(currentUser.role)) {
        throw new ForbiddenError('Not authorized to update staff');
      }

      // Try to find staff member in User collection
      const staffUser = await User.findOne({
        _id: id,
        restaurantId: currentUser.restaurantId,
        role: 'Staff'
      });

      if (staffUser) {
        // Update user status if provided
        if (updateData.status) {
          staffUser.isActive = updateData.status === 'Active';
        }

        // Update other fields
        if (updateData.phone) staffUser.phone = updateData.phone;
        
        await staffUser.save();

        res.status(200).json({
          status: 'success',
          data: {
            id: staffUser._id.toString(),
            email: staffUser.email,
            name: staffUser.name,
            phone: staffUser.phone,
            position: 'Staff',
            restaurantId: staffUser.restaurantId?.toString() || currentUser.restaurantId.toString(),
            status: staffUser.isActive ? 'Active' as InviteStatus : 'Inactive' as InviteStatus,
            updatedAt: new Date()
          }
        });
        return;
      }

      // If not found in users, check staff invites
      const staffInvite = await StaffInvitation.findOne({
        _id: id,
        restaurantId: currentUser.restaurantId
      });

      if (!staffInvite) {
        throw new NotFoundError('Staff member not found');
      }

      // Update staff invite
      if (updateData.position) staffInvite.position = updateData.position;
      if (updateData.status) staffInvite.status = updateData.status;
      if (updateData.phone) staffInvite.phone = updateData.phone;

      await staffInvite.save();

      res.status(200).json({
        status: 'success',
        data: {
          id: staffInvite._id.toString(),
          email: staffInvite.email,
          name: staffInvite.name,
          phone: staffInvite.phone,
          position: staffInvite.position,
          restaurantId: staffInvite.restaurantId.toString(),
          status: staffInvite.status,
          invitedBy: staffInvite.invitedBy.toString(),
          invitedAt: staffInvite.invitedAt,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public async deleteStaff(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      // Validate ID
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestError('Invalid staff ID');
      }

      // Check authorization
      if (!currentUser.restaurantId) {
        throw new ForbiddenError('Restaurant ID is required');
      }

      if (!['Restaurant_Admin'].includes(currentUser.role)) {
        throw new ForbiddenError('Not authorized to delete staff');
      }

      // Try to find staff member in User collection
      const staffUser = await User.findOne({
        _id: id,
        restaurantId: currentUser.restaurantId,
        role: 'Staff'
      });

      if (staffUser) {
        // Soft delete by marking as inactive
        staffUser.isActive = false;
        await staffUser.save();

        res.status(200).json({
          status: 'success',
          data: {
            id: staffUser._id.toString(),
            email: staffUser.email,
            name: staffUser.name,
            message: 'Staff member deactivated successfully'
          }
        });
        return;
      }

      // If not found in users, check staff invites
      const staffInvite = await StaffInvitation.findOne({
        _id: id,
        restaurantId: currentUser.restaurantId
      });

      if (!staffInvite) {
        throw new NotFoundError('Staff member not found');
      }

      // For invitations, we can do a hard delete
      await StaffInvitation.deleteOne({ _id: id });

      res.status(200).json({
        status: 'success',
        data: {
          id: staffInvite._id.toString(),
          email: staffInvite.email,
          name: staffInvite.name,
          message: 'Staff invitation deleted successfully'
        }
      });
    } catch (error) {
      next(error);
    }
  }
} 