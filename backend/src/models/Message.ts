import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  orderId: mongoose.Types.ObjectId;
  onModel: 'Order' | 'BundleOrder';
  senderId: mongoose.Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'file' | 'credentials' | 'bundle_credentials' | 'system';
  status: 'sent' | 'delivered' | 'seen';
  metadata?: any;
  sentAt?: Date;
  deliveredAt?: Date;
  seenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      refPath: 'onModel',
      required: true,
      index: true,
    },
    onModel: {
      type: String,
      enum: ['Order', 'BundleOrder'],
      default: 'Order',
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'credentials', 'bundle_credentials', 'system'],
      default: 'text',
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'seen'],
      default: 'sent',
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    deliveredAt: Date,
    seenAt: Date,
  },
  { timestamps: true }
);

messageSchema.index({ orderId: 1, createdAt: -1 });
messageSchema.index({ orderId: 1, senderId: 1, status: 1 });
messageSchema.index({ senderId: 1, status: 1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
