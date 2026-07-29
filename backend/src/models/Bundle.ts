import mongoose, { Schema, Document } from 'mongoose';

export interface IBundleProduct {
  product: mongoose.Types.ObjectId;
  price: number;
  duration: string;
  accountType: string;
  screens: string;
  warranty: string;
  deliveryTime: string;
  autoRenewal: boolean;
  notes: string;
}

export interface IBundle extends Document {
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  bannerImage: string;
  tags: string[];
  status: 'active' | 'inactive' | 'pending';
  visibility: 'public' | 'hidden';
  seller: mongoose.Types.ObjectId;
  products: IBundleProduct[];
  bundlePrice: number;
  originalPrice: number;
  ratings: number;
  totalReviews: number;
  totalSales: number;
  createdAt: Date;
  updatedAt: Date;
}

const bundleProductSchema = new Schema<IBundleProduct>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  price: { type: Number, required: true, min: 0 },
  duration: { type: String, default: '1 month' },
  accountType: { type: String, default: 'Shared' },
  screens: { type: String, default: '1 Screen' },
  warranty: { type: String, default: 'Full' },
  deliveryTime: { type: String, default: 'Instant' },
  autoRenewal: { type: Boolean, default: false },
  notes: { type: String, default: '' },
});

const bundleSchema = new Schema<IBundle>(
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
      maxlength: 3000,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'bundles',
        'ott-bundles',
        'gaming-bundles',
        'music-bundles',
        'ai-tools-bundles',
        'software-bundles',
        'custom-bundles'
      ],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    bannerImage: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending',
    },
    visibility: {
      type: String,
      enum: ['public', 'hidden'],
      default: 'public',
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: {
      type: [bundleProductSchema],
      validate: [
        (val: IBundleProduct[]) => val.length > 1,
        'A bundle must contain at least 2 products',
      ],
    },
    bundlePrice: {
      type: Number,
      required: [true, 'Bundle Price is required'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
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

bundleSchema.index({ title: 'text', description: 'text', tags: 'text' });
bundleSchema.index({ seller: 1 });
bundleSchema.index({ status: 1 });
bundleSchema.index({ category: 1 });

export const Bundle = mongoose.model<IBundle>('Bundle', bundleSchema);
