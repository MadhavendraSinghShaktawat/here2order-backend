import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRestaurant extends Document {
  _id: Types.ObjectId;
  name: string;
  adminId: Types.ObjectId;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  businessHours: {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }[];
  isActive: boolean;
  settings: {
    currency: string;
    language: string;
    timezone: string;
    tableCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    unique: true
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    }
  },
  contact: {
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  },
  businessHours: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    open: {
      type: String,
      required: true
    },
    close: {
      type: String,
      required: true
    },
    isClosed: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true,
    required: true
  },
  settings: {
    currency: {
      type: String,
      default: 'USD'
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    tableCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes
restaurantSchema.index({ name: 1 });
restaurantSchema.index({ 'address.city': 1 });

// Add a pre-save hook to ensure adminId is set before saving updates
restaurantSchema.pre('save', function(next) {
  if (!this.isNew && !this.adminId) {
    next(new Error('adminId is required for existing restaurants'));
    return;
  }
  next();
});

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', restaurantSchema); 