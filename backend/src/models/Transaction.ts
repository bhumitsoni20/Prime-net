import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  transactionId: string;
  order: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  grossAmount: number;
  platformCommission: number;
  netEarning: number;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    grossAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    platformCommission: {
      type: Number,
      required: true,
      default: 0,
    },
    netEarning: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ seller: 1, status: 1, createdAt: -1 });
transactionSchema.index({ seller: 1, type: 1, status: 1 });
transactionSchema.index({ seller: 1, createdAt: -1 });
transactionSchema.index({ order: 1, type: 1 }, { unique: true });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
