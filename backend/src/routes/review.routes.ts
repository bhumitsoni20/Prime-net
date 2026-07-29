import { Router } from 'express';
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  checkEligibility,
  getBundleReviews,
} from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/', authenticate, validate(['rating']), createReview);
router.get('/product/:productId', getProductReviews);
router.get('/bundle/:bundleId', getBundleReviews);
router.get('/eligibility/:productId', authenticate, checkEligibility);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

export default router;
