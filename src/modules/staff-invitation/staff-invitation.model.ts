import mongoose, { Schema, Document, Types } from 'mongoose';

export type InviteStatus = 'Pending' | 'Active' | 'Inactive' | 'Expired';

export interface IStaffInvitation extends Document {
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

const staffInvitationSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
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
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Inactive', 'Expired'],
    default: 'Pending',
    required: true
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
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
staffInvitationSchema.index({ email: 1, restaurantId: 1 }, { unique: true });
staffInvitationSchema.index({ token: 1 }, { unique: true });

// Middleware to automatically expire invitations
staffInvitationSchema.pre('save', function(next) {
  if (this.expiresAt < new Date() && this.status === 'Pending') {
    this.status = 'Expired' as InviteStatus;
  }
  next();
});

export const StaffInvitation = mongoose.model<IStaffInvitation>('StaffInvitation', staffInvitationSchema); 