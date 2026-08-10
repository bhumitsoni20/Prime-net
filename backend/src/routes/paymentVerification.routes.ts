import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import {
  getVerificationRequests,
  approvePayment,
  rejectPayment,
  updatePaymentSettings,
} from '../controllers/paymentVerification.controller';

const router = Router();

// Admin only routes
router.use(authenticate, authorize('admin'));

router.get('/', getVerificationRequests);
router.post('/:id/approve', approvePayment);
router.post('/:id/reject', rejectPayment);
router.put('/settings', updatePaymentSettings);

export default router;
