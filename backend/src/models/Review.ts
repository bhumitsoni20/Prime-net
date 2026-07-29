import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  product?: mongoose.Types.ObjectId;
  bundle?: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    bundle: {
      type: Schema.Types.ObjectId,
      ref: 'Bundle',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ bundle: 1, createdAt: -1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true, partialFilterExpression: { product: { $exists: true } } });
reviewSchema.index({ user: 1, bundle: 1 }, { unique: true, partialFilterExpression: { bundle: { $exists: true } } });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
