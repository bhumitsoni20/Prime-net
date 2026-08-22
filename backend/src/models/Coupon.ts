import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
  expiresAt?: Date;
  usageCount: number;
  maxUsage: number;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    maxUsage: {
      type: Number,
      default: 1, // Global single-use by default as requested
    },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);
