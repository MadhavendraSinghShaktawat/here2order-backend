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
  deviceId?: string;
  tableId?: Types.ObjectId;
  canAccessRestaurant(restaurantId: string): boolean;
}

const userSchema = new Schema({
  email: {
    type: String,
    required: function(this: IUser) {
      return ['SuperAdmin', 'Restaurant_Admin', 'Staff'].includes(this.role);
    },
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function(this: IUser) {
      return ['SuperAdmin', 'Restaurant_Admin', 'Staff'].includes(this.role);
    },
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
  },
  deviceId: {
    type: String,
    sparse: true
  },
  tableId: {
    type: Schema.Types.ObjectId,
    ref: 'Table'
  }
}, {
  timestamps: true
});

// Only create the compound index
userSchema.index({ role: 1, restaurantId: 1 });

// Add compound index for device ID and restaurant
userSchema.index({ deviceId: 1, restaurantId: 1 }, { sparse: true });

// Methods
userSchema.methods.canAccessRestaurant = function(restaurantId: string): boolean {
  console.log('Checking restaurant access:', {
    userRole: this.role,
    userRestaurantId: this.restaurantId?.toString(),
    requestedRestaurantId: restaurantId
  });

  if (this.role === 'SuperAdmin') return true;
  if (this.role === 'Customer') {
    // Customers can access the restaurant they're currently in
    return this.restaurantId?.toString() === restaurantId;
  }
  // Staff and Restaurant_Admin can only access their assigned restaurant
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