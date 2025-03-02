import mongoose, { Schema, Document } from 'mongoose';
import { StaffInviteDto } from './staff.types';

const staffInviteSchema = new Schema({
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
    enum: ['Pending', 'Active', 'Inactive'],
    default: 'Pending'
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
staffInviteSchema.index({ email: 1, restaurantId: 1 }, { unique: true });
staffInviteSchema.index({ token: 1 });
staffInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const StaffInvite = mongoose.model<StaffInviteDto & Document>('StaffInvite', staffInviteSchema); 