import mongoose, { Schema, Document } from 'mongoose';
import { IStaffInvite } from '../staff/staff.types';

export enum InviteStatus {
  Pending = 'Pending',
  Active = 'Active',
  Inactive = 'Inactive'
}

const staffInvitationSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  status: {
    type: String,
    enum: Object.values(InviteStatus),
    default: InviteStatus.Pending
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitedAt: {
    type: Date,
    default: Date.now
  },
  joinedAt: {
    type: Date
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Indexes
staffInvitationSchema.index({ email: 1, restaurantId: 1 }, { unique: true });
staffInvitationSchema.index({ token: 1 });
staffInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const StaffInvitation = mongoose.model<IStaffInvite & Document>('StaffInvitation', staffInvitationSchema); 