import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentVerification extends Document {
  orderId: mongoose.Types.ObjectId;
  orderType: 'Order' | 'BundleOrder';
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  amount: number;
  paymentScreenshot: string; // base64
  status: 'pending_verification' | 'payment_verified' | 'payment_rejected';
  rejectionReason?: string;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentVerificationSchema = new Schema<IPaymentVerification>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    orderType: {
      type: String,
      enum: ['Order', 'BundleOrder'],
      required: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
    paymentScreenshot: {
      type: String, // base64 string
      required: true,
    },
    status: {
      type: String,
      enum: ['pending_verification', 'payment_verified', 'payment_rejected'],
      default: 'pending_verification',
    },
    rejectionReason: {
      type: String,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

paymentVerificationSchema.index({ status: 1, createdAt: -1 });
paymentVerificationSchema.index({ orderId: 1 });
paymentVerificationSchema.index({ buyer: 1, createdAt: -1 });
paymentVerificationSchema.index({ seller: 1, createdAt: -1 });

const PaymentVerification = mongoose.model<IPaymentVerification>('PaymentVerification', paymentVerificationSchema);

export default PaymentVerification;
