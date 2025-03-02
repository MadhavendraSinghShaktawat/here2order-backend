import { Types } from 'mongoose';
import { InviteStatus } from '../staff-invitation/staff-invitation.model';

export interface StaffInviteDto {
  email: string;
  name: string;
  phone?: string;
  position: string;
}

export interface StaffResponse {
  id: string;
  email: string;
  name: string;
  phone?: string;
  position: string;
  restaurantId: string;
  status: InviteStatus;
  invitedBy: string;
  invitedAt: Date;
  joinedAt?: Date;
}

export interface IStaffInvite {
  _id: Types.ObjectId;
  email: string;
  name: string;
  phone?: string;
  position: string;
  restaurantId: Types.ObjectId;
  status: InviteStatus;
  invitedBy: Types.ObjectId;
  invitedAt: Date;
  joinedAt?: Date;
  token: string;
  expiresAt: Date;
}

export interface UpdateStaffDto {
  position?: string;
  status?: InviteStatus;
  phone?: string;
} 