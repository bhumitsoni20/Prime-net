import mongoose, { Schema, Document } from 'mongoose';

export interface IBundleCredential {
  masterProductId: mongoose.Types.ObjectId;
  email?: string;
  password?: string;
  pin?: string;
  recoveryEmail?: string;
  notes?: string;
  deliveryStatus: 'pending' | 'delivered';
  deliveredAt?: Date;
}

export interface IBundleOrder extends Document {
  user: mongoose.Types.ObjectId;
  bundle: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: 'upi' | 'razorpay' | 'coupon' | 'wallet';
  paymentStatus: 'pending' | 'pending_verification' | 'payment_verified' | 'paid' | 'payment_rejected' | 'failed' | 'refunded' | 'not_required';
  orderStatus: 'placed' | 'preparing' | 'partial' | 'delivered' | 'completed' | 'cancelled';
  paymentId: string;
  originalAmount?: number;
  couponCode?: string;
  couponId?: mongoose.Types.ObjectId;
  discountAmount?: number;
  finalAmount?: number;
  sessionId?: string;
  credentials: IBundleCredential[];
  timeline: {
    status: string;
    date: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const bundleCredentialSchema = new Schema<IBundleCredential>({
  masterProductId: {
    type: Schema.Types.ObjectId,
    ref: 'MasterProduct',
    required: true,
  },
  email: String,
  password: String,
  pin: String,
  recoveryEmail: String,
  notes: String,
  deliveryStatus: {
    type: String,
    enum: ['pending', 'delivered'],
    default: 'pending',
  },
  deliveredAt: Date,
});

const bundleOrderSchema = new Schema<IBundleOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bundle: {
      type: Schema.Types.ObjectId,
      ref: 'Bundle',
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'razorpay', 'coupon', 'wallet'],
      required: true,
      default: 'wallet'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'pending_verification', 'payment_verified', 'paid', 'payment_rejected', 'failed', 'refunded', 'not_required'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'preparing', 'partial', 'delivered', 'completed', 'cancelled'],
      default: 'placed',
    },
    originalAmount: { type: Number },
    couponCode: { type: String },
    couponId: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    discountAmount: { type: Number },
    finalAmount: { type: Number },
    paymentId: {
      type: String,
      default: '',
    },
    sessionId: {
      type: String,
    },
    credentials: [bundleCredentialSchema],
    timeline: [
      {
        status: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

bundleOrderSchema.index({ user: 1, createdAt: -1 });
bundleOrderSchema.index({ seller: 1, paymentStatus: 1, createdAt: -1 }); // Added compound index for dashboard
bundleOrderSchema.index({ paymentStatus: 1 });
bundleOrderSchema.index({ orderStatus: 1 });

export const BundleOrder = mongoose.model<IBundleOrder>('BundleOrder', bundleOrderSchema);
