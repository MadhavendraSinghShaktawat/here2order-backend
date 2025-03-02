import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMenuCategory extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  restaurantId: Types.ObjectId;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const menuCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure category names are unique per restaurant
menuCategorySchema.index({ restaurantId: 1, name: 1 }, { unique: true });

export const MenuCategory = mongoose.model<IMenuCategory>('MenuCategory', menuCategorySchema); 