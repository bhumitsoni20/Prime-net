import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getBuyerWallet,
  requestTopup,
  requestWithdrawal,
} from '../controllers/wallet.controller';

const router = Router();

router.use(authenticate);

router.get('/me', getBuyerWallet);
router.post('/topup', requestTopup);
router.post('/withdraw', requestWithdrawal);

export default router;
