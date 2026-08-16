import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  description: string;
  category: string;
  planName?: string;
  deviceLoginCount?: number;
  deviceLoginType?: string;
  logo: string;
  price: number;
  originalPrice?: number;
  seller: mongoose.Types.ObjectId;
  masterProduct?: mongoose.Types.ObjectId;
  status: 'active' | 'inactive' | 'pending' | 'sold';
  features: string[];
  duration: string;
  ratings: number;
  totalReviews: number;
  totalSales: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 2000,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'ott',
        'ai-tools',
        'vpn',
        'education',
        'software',
        'cloud-storage',
        'music',
        'gaming',
        'other',
      ],
    },
    planName: {
      type: String,
      trim: true,
    },
    deviceLoginCount: {
      type: Number,
      min: 1,
      max: 5,
    },
    deviceLoginType: {
      type: String,
      enum: ['Mobile Only', 'TV/PC Only', 'Own Mail', 'Own Number'],
    },
    logo: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    masterProduct: {
      type: Schema.Types.ObjectId,
      ref: 'MasterProduct',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'sold'],
      default: 'pending',
    },
    features: {
      type: [String],
      default: [],
    },
    duration: {
      type: String,
      default: '1 month',
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ status: 1 });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });
productSchema.index({ category: 1, status: 1, createdAt: -1 }); // Added compound index for homepage
productSchema.index({ seller: 1, status: 1, createdAt: -1 }); // Added compound index for seller dashboard
productSchema.index({ createdAt: -1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);
