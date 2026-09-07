import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import {
  getSellerWallet,
  updatePayoutSettings,
  requestWithdrawal,
  getAdminPayouts,
  approvePayout,
  rejectPayout,
} from '../controllers/payout.controller';

const router = Router();

// Seller Routes
router.get('/seller/wallet', authenticate, authorize('seller', 'admin'), getSellerWallet);
router.post('/seller/settings', authenticate, authorize('seller', 'admin'), updatePayoutSettings);
router.post('/seller/withdraw', authenticate, authorize('seller', 'admin'), requestWithdrawal);

// Admin Routes
router.get('/admin/requests', authenticate, authorize('admin'), getAdminPayouts);
router.post('/admin/requests/:id/approve', authenticate, authorize('admin'), approvePayout);
router.post('/admin/requests/:id/reject', authenticate, authorize('admin'), rejectPayout);

export default router;
