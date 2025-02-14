import mongoose, { Schema, Document, Types } from 'mongoose';

export type InvitationStatus = 'Pending' | 'Accepted' | 'Expired' | 'Cancelled';

export interface IStaffInvitation extends Document {
  _id: Types.ObjectId;
  email: string;
  restaurantId: Types.ObjectId;
  invitedBy: Types.ObjectId;
  role: 'Staff';
  status: InvitationStatus;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const staffInvitationSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['Staff'],
    default: 'Staff',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Expired', 'Cancelled'],
    default: 'Pending',
    required: true
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
  },
  acceptedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
staffInvitationSchema.index({ email: 1, restaurantId: 1 }, { unique: true });
staffInvitationSchema.index({ token: 1 }, { unique: true });
staffInvitationSchema.index({ status: 1 });

// Middleware to automatically expire invitations
staffInvitationSchema.pre('save', function(next) {
  if (this.expiresAt < new Date() && this.status === 'Pending') {
    this.status = 'Expired';
  }
  next();
});

export const StaffInvitation = mongoose.model<IStaffInvitation>('StaffInvitation', staffInvitationSchema); 