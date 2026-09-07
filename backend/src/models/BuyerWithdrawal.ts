import mongoose, { Schema, Document } from 'mongoose';

export interface IBuyerWithdrawal extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  upiId: string;
  beneficiaryName?: string;
  status: 'pending' | 'completed' | 'rejected';
  adminNote?: string;
  transactionReference?: string;
  rejectionReason?: string;
  processedAt?: Date;
  processedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const buyerWithdrawalSchema = new Schema<IBuyerWithdrawal>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Minimum withdrawal amount is ₹1'],
    },
    upiId: {
      type: String,
      required: [true, 'UPI ID is required'],
      trim: true,
    },
    beneficiaryName: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'rejected'],
      default: 'pending',
    },
    adminNote: {
      type: String,
      trim: true,
      default: '',
    },
    transactionReference: {
      type: String,
      trim: true,
      default: '',
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    processedAt: {
      type: Date,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

buyerWithdrawalSchema.index({ user: 1, status: 1, createdAt: -1 });
buyerWithdrawalSchema.index({ status: 1, createdAt: -1 });
buyerWithdrawalSchema.index({ createdAt: -1 });

export const BuyerWithdrawal = mongoose.model<IBuyerWithdrawal>('BuyerWithdrawal', buyerWithdrawalSchema);
