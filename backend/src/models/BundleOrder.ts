import mongoose, { Schema, Document } from 'mongoose';

export interface IBundleCredential {
  productId: mongoose.Types.ObjectId;
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
  paymentMethod: 'razorpay' | 'stripe';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'placed' | 'preparing' | 'partial' | 'delivered' | 'completed' | 'cancelled';
  paymentId: string;
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
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
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
      enum: ['razorpay', 'stripe'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'preparing', 'partial', 'delivered', 'completed', 'cancelled'],
      default: 'placed',
    },
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
bundleOrderSchema.index({ seller: 1, createdAt: -1 });
bundleOrderSchema.index({ paymentStatus: 1 });
bundleOrderSchema.index({ orderStatus: 1 });

export const BundleOrder = mongoose.model<IBundleOrder>('BundleOrder', bundleOrderSchema);
