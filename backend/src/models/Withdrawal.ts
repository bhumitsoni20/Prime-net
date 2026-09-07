import mongoose, { Schema, Document } from 'mongoose';

export interface IWithdrawal extends Document {
  seller: mongoose.Types.ObjectId;
  amount: number;
  upiId: string;
  qrCode?: string;
  status: 'pending' | 'completed' | 'rejected';
  adminNote?: string;
  transactionReference?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalSchema = new Schema<IWithdrawal>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Minimum withdrawal amount is ₹1'],
    },
    upiId: {
      type: String,
      required: [true, 'UPI ID is required'],
      trim: true,
    },
    qrCode: {
      type: String,
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
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

withdrawalSchema.index({ seller: 1, status: 1, createdAt: -1 });
withdrawalSchema.index({ seller: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

export const Withdrawal = mongoose.model<IWithdrawal>('Withdrawal', withdrawalSchema);
