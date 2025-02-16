import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITable extends Document {
  _id: Types.ObjectId;
  restaurantId: Types.ObjectId;
  tableNumber: string;
  name: string;
  capacity: number;
  isActive: boolean;
  qrCodeUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const tableSchema = new Schema({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true
  },
  tableNumber: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  qrCodeUrl: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Ensure table numbers are unique per restaurant
tableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

export const Table = mongoose.model<ITable>('Table', tableSchema); 