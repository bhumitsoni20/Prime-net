import mongoose, { Schema, Document } from 'mongoose';

export interface IProductRequest extends Document {
  title: string;
  category: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  duration?: number;
  referenceUrl?: string;
  attachments: string[];
  requestedBy: mongoose.Types.ObjectId;
  status: 'Pending' | 'Under Review' | 'Accepted' | 'In Progress' | 'Fulfilled' | 'Rejected' | 'Cancelled';
  fulfilledAt?: Date;
  fulfilledProduct?: mongoose.Types.ObjectId;
  seller?: mongoose.Types.ObjectId;
  adminNotes?: string;
  emailSent: boolean;
  notificationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productRequestSchema = new Schema<IProductRequest>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'ott',
        'ai-tools',
        'vpn',
        'education',
        'software',
        'cloud-storage',
        'music',
        'gaming',
        'other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 2000,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    duration: {
      type: Number,
      min: 1,
    },
    referenceUrl: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        type: String,
      },
    ],
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Under Review',
        'Accepted',
        'In Progress',
        'Fulfilled',
        'Rejected',
        'Cancelled',
      ],
      default: 'Pending',
    },
    fulfilledAt: {
      type: Date,
    },
    fulfilledProduct: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    adminNotes: {
      type: String,
      maxlength: 1000,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
productRequestSchema.index({ status: 1 });
productRequestSchema.index({ priority: 1 });
productRequestSchema.index({ requestedBy: 1 });
productRequestSchema.index({ seller: 1 });
productRequestSchema.index({ category: 1 });

export const ProductRequest = mongoose.model<IProductRequest>('ProductRequest', productRequestSchema);
