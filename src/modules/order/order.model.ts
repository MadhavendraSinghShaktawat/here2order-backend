import mongoose, { Schema, Document, Types, CallbackError } from 'mongoose';

export interface IOrderItem {
  menuItemId: Types.ObjectId;
  quantity: number;
  price: number;
  notes?: string;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  restaurantId: Types.ObjectId;
  tableId: Types.ObjectId;
  customerId: Types.ObjectId;
  items: IOrderItem[];
  status: 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';
  totalAmount: number;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema({
  menuItemId: {
    type: Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    maxlength: 200
  }
});

const orderSchema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  tableId: {
    type: Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  specialInstructions: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Generate unique order number
orderSchema.pre('validate', async function(next) {
  try {
    if (this.isNew && !this.orderNumber) {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      
      // Get count of orders for today
      const count = await mongoose.model('Order').countDocuments({
        createdAt: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999))
        },
        restaurantId: this.restaurantId
      });

      // Format: YYMMDD-RID-SEQUENCE
      const restaurantSuffix = this.restaurantId.toString().slice(-3);
      const sequence = (count + 1).toString().padStart(3, '0');
      this.orderNumber = `${year}${month}${day}-${restaurantSuffix}-${sequence}`;
    }
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

// Add indexes
orderSchema.index({ restaurantId: 1, status: 1 });
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ tableId: 1, status: 1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });

export const Order = mongoose.model<IOrder>('Order', orderSchema); 