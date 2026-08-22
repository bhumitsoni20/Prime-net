import { Router } from 'express';
import {
  createCoupon,
  getCoupons,
  toggleCouponStatus,
  deleteCoupon,
  validateCoupon,
} from '../controllers/coupon.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

// Public / Buyer validation endpoint
router.post('/validate', authenticate, validateCoupon);

// Admin endpoints
router.post('/', authenticate, authorize('admin'), createCoupon);
router.get('/', authenticate, authorize('admin'), getCoupons);
router.patch('/:id/toggle', authenticate, authorize('admin'), toggleCouponStatus);
router.delete('/:id', authenticate, authorize('admin'), deleteCoupon);

export default router;
