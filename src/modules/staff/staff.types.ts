import { Types } from 'mongoose';

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
  status: 'Pending' | 'Active' | 'Inactive';
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
  status: 'Pending' | 'Active' | 'Inactive';
  invitedBy: Types.ObjectId;
  invitedAt: Date;
  joinedAt?: Date;
  token: string;
  expiresAt: Date;
} 