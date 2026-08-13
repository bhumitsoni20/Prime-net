import { Router } from 'express';
import { applySeller, getMyApplicationStatus, getWallet } from '../controllers/seller.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

router.use(authenticate);

router.post('/application', applySeller);
router.get('/application/me', getMyApplicationStatus);
router.get('/wallet', authorize('seller', 'admin'), getWallet);

export default router;
