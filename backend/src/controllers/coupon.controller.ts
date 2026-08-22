import { Request, Response } from 'express';
import { Coupon } from '../models/Coupon';
import { CouponRedemption } from '../models/CouponRedemption';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

// Admin: Create a new coupon
export const createCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { code, discountType, discountValue, expiresAt, isActive, maxUsage } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return sendError(res, 'Code, discount type, and value are required.', 400);
    }

    if (discountType === 'percentage' && (discountValue < 1 || discountValue > 100)) {
      return sendError(res, 'Percentage discount must be between 1 and 100.', 400);
    }
    if (discountType === 'fixed' && discountValue <= 0) {
      return sendError(res, 'Fixed discount must be greater than 0.', 400);
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return sendError(res, 'Coupon code already exists.', 409);
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      expiresAt,
      isActive: isActive !== undefined ? isActive : true,
      maxUsage: maxUsage || 1
    });

    return sendSuccess(res, coupon, 'Coupon created successfully.', 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

// Admin: Get all coupons
export const getCoupons = async (req: AuthRequest, res: Response) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    
    // Attach redemption stats for admin
    const couponsWithStats = await Promise.all(
      coupons.map(async (coupon) => {
        const redemptions = await CouponRedemption.find({ couponId: coupon._id })
          .populate('userId', 'name email')
          .sort({ redeemedAt: -1 })
          .limit(5); // Show latest 5
        return {
          ...coupon.toObject(),
          recentRedemptions: redemptions
        };
      })
    );

    return sendSuccess(res, couponsWithStats, 'Coupons fetched successfully.', 200);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

// Admin: Toggle active status
export const toggleCouponStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) return sendError(res, 'Coupon not found', 404);

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return sendSuccess(res, coupon, 'Coupon status updated.', 200);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

// Admin: Delete coupon
export const deleteCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Coupon.findByIdAndDelete(id);
    return sendSuccess(res, null, 'Coupon deleted.', 200);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

// Public: Validate coupon during checkout
export const validateCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { couponCode, cartTotal } = req.body;

    if (!couponCode) return sendError(res, 'Coupon code is required.', 400);
    if (!cartTotal || cartTotal <= 0) return sendError(res, 'Cart total is required.', 400);

    const code = couponCode.toUpperCase();
    const coupon = await Coupon.findOne({ code, isActive: true });

    if (!coupon) {
      return sendError(res, 'Invalid or inactive coupon code.', 404);
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return sendError(res, 'This coupon has expired.', 400);
    }

    if (coupon.usageCount >= coupon.maxUsage) {
      return sendError(res, 'Coupon usage limit has been reached.', 400);
    }

    // Check if THIS user already redeemed it
    const existingRedemption = await CouponRedemption.findOne({ 
      couponId: coupon._id, 
      userId: req.user._id 
    });
    
    if (existingRedemption) {
      return sendError(res, 'You have already used this coupon.', 400);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    const finalAmount = cartTotal - discountAmount;

    return sendSuccess(res, {
      originalAmount: cartTotal,
      discountAmount,
      finalAmount,
      couponId: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    }, 'Coupon applied successfully.', 200);

  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};
