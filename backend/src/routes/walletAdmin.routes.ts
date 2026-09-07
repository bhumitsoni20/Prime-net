import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import {
  getAdminWalletTopups,
  getAdminWalletTopupById,
  approveWalletTopup,
  rejectWalletTopup,
  getAdminBuyerRefunds,
  approveBuyerRefund,
  rejectBuyerRefund,
} from '../controllers/walletAdmin.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

// Wallet Top-Ups Verification
router.get('/topups', getAdminWalletTopups);
router.get('/topups/:id', getAdminWalletTopupById);
router.post('/topups/:id/approve', approveWalletTopup);
router.post('/topups/:id/reject', rejectWalletTopup);

// Buyer Refunds & Withdrawals
router.get('/refunds', getAdminBuyerRefunds);
router.post('/refunds/:id/approve', approveBuyerRefund);
router.post('/refunds/:id/reject', rejectBuyerRefund);

export default router;
