import mongoose, { Schema, Document } from 'mongoose';

export interface IMasterProduct extends Document {
  name: string;
  imageUrl: string;
  planNames: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const masterProductSchema = new Schema<IMasterProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      unique: true,
      trim: true,
      maxlength: 200,
    },
    imageUrl: {
      type: String,
      required: [true, 'Product image is required'],
    },
    planNames: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

masterProductSchema.index({ name: 'text' });

export const MasterProduct = mongoose.model<IMasterProduct>('MasterProduct', masterProductSchema);
