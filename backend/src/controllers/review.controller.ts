import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';

// POST /api/reviews
export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if already reviewed
    const existing = await Review.findOne({
      user: req.user._id,
      product: productId,
    });
    if (existing) return sendError(res, 'You already reviewed this product.', 400);

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
    });

    // Update product ratings
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    // Penalty system for sellers
    if (rating < 3) {
      const product = await Product.findById(productId);
      if (product && product.seller) {
        const { User } = await import('../models/User');
        const { sendSellerSuspensionEmail } = await import('../services/email.service');
        
        const seller = await User.findById(product.seller);
        if (seller) {
          seller.badReviewCount = (seller.badReviewCount || 0) + 1;
          
          if (seller.badReviewCount > 4) {
            const now = new Date();
            seller.suspensionExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
            seller.probationExpiry = new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000); // 24 hours + 10 days
            seller.badReviewCount = 0; // Reset count
            
            await sendSellerSuspensionEmail(seller.email, seller.name);
          }
          await seller.save();
        }
      }
    }

    await Product.findByIdAndUpdate(productId, {
      ratings: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    });

    return sendSuccess(res, review, 'Review added.', 201);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/reviews/product/:productId
export const getProductReviews = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ product: req.params.productId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ product: req.params.productId }),
    ]);

    return sendPaginated(res, reviews, page, limit, total);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/reviews/eligibility/:productId
export const checkEligibility = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const order = await Order.findOne({
      user: req.user._id,
      product: productId,
      paymentStatus: 'paid'
    });

    if (!order) {
      return sendSuccess(res, { canReview: false, reason: 'purchase_required' });
    }

    const existingReview = await Review.exists({
      user: req.user._id,
      product: productId,
    });

    if (existingReview) {
      return sendSuccess(res, { canReview: false, reason: 'already_reviewed' });
    }

    return sendSuccess(res, { canReview: true });
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// PUT /api/reviews/:id
export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return sendError(res, 'Review not found.', 404);

    if (review.user.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized.', 403);
    }

    const { rating, comment } = req.body;
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    // Recalculate product rating
    const reviews = await Review.find({ product: review.product });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(review.product, {
      ratings: Math.round(avgRating * 10) / 10,
    });

    return sendSuccess(res, review, 'Review updated.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// DELETE /api/reviews/:id
export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return sendError(res, 'Review not found.', 404);

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized.', 403);
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate product rating
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    await Product.findByIdAndUpdate(productId, {
      ratings: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    });

    return sendSuccess(res, null, 'Review deleted.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};
