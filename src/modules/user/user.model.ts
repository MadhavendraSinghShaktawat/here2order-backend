import mongoose, { Schema, Document, Types } from 'mongoose';
import { UserRole } from './user.types';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  restaurantId?: Types.ObjectId;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['SuperAdmin', 'Restaurant_Admin', 'Staff', 'Customer'],
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: function(this: IUser) {
      return ['Restaurant_Admin', 'Staff'].includes(this.role);
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Only create the compound index
userSchema.index({ role: 1, restaurantId: 1 });

// Methods
userSchema.methods.canAccessRestaurant = function(restaurantId: string): boolean {
  if (this.role === 'SuperAdmin') return true;
  return this.restaurantId?.toString() === restaurantId;
};

// Middleware
userSchema.pre('save', function(next) {
  // Clear restaurantId if user is not admin or staff
  if (!['Restaurant_Admin', 'Staff'].includes(this.role)) {
    this.restaurantId = undefined;
  }
  next();
});

export const User = mongoose.model<IUser>('User', userSchema); 