import mongoose, { Schema, Document } from 'mongoose';

export interface ICouponRedemption extends Document {
  couponId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  redeemedAt: Date;
}

const couponRedemptionSchema = new Schema<ICouponRedemption>({
  couponId: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  redeemedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only redeem a specific coupon once
couponRedemptionSchema.index({ couponId: 1, userId: 1 }, { unique: true });

export const CouponRedemption = mongoose.model<ICouponRedemption>('CouponRedemption', couponRedemptionSchema);
