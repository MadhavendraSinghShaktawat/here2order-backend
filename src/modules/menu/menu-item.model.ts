import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMenuItem extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  categoryId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  imageUrl?: string;
  isActive: boolean;
  isAvailable: boolean;
  preparationTime?: number; // in minutes
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'MenuCategory',
    required: true
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number,
    min: 0
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure item names are unique per restaurant
menuItemSchema.index({ name: 1, restaurantId: 1 }, { unique: true });

// Index for category lookup
menuItemSchema.index({ categoryId: 1, restaurantId: 1 });

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', menuItemSchema); 