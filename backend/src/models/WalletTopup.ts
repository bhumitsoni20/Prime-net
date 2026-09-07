import mongoose, { Schema, Document } from 'mongoose';

export interface IWalletTopup extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  paymentScreenshot: string; // base64 string or image URL
  upiReference?: string;
  status: 'pending_verification' | 'completed' | 'rejected';
  rejectionReason?: string;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const walletTopupSchema = new Schema<IWalletTopup>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [30, 'Minimum top-up amount is ₹30'],
      max: [1000, 'Maximum top-up amount is ₹1,000'],
    },
    paymentScreenshot: {
      type: String,
      required: [true, 'Payment screenshot is required'],
    },
    upiReference: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending_verification', 'completed', 'rejected'],
      default: 'pending_verification',
    },
    rejectionReason: {
      type: String,
      default: '',
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

walletTopupSchema.index({ user: 1, status: 1, createdAt: -1 });
walletTopupSchema.index({ status: 1, createdAt: -1 });
walletTopupSchema.index({ createdAt: -1 });

export const WalletTopup = mongoose.model<IWalletTopup>('WalletTopup', walletTopupSchema);
