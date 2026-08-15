import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: 'upi' | 'razorpay';
  paymentStatus: 'pending' | 'pending_verification' | 'payment_verified' | 'paid' | 'payment_rejected' | 'failed' | 'refunded';
  orderStatus: 'placed' | 'preparing' | 'delivered' | 'completed' | 'cancelled';
  paymentId: string;
  sessionId?: string;
  credentials?: {
    email?: string;
    password?: string;
    notes?: string;
  };
  timeline: {
    status: string;
    date: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
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
      enum: ['upi', 'razorpay'],
      required: true,
      default: 'upi'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'pending_verification', 'payment_verified', 'paid', 'payment_rejected', 'failed', 'refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'preparing', 'delivered', 'completed', 'cancelled'],
      default: 'placed',
    },
    paymentId: {
      type: String,
      default: '',
    },
    sessionId: {
      type: String,
    },
    credentials: {
      email: String,
      password: String,
      notes: String,
    },
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

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ seller: 1, paymentStatus: 1, createdAt: -1 }); // Added compound index for dashboard
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
