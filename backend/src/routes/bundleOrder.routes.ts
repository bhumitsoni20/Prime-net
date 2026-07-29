import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import {
  createBundleOrder,
  getMyBundleOrders,
  getBundleOrder,
  deliverBundleCredential
} from '../controllers/bundleOrder.controller';

const router = Router();

router.post('/', authenticate, createBundleOrder);
router.get('/', authenticate, getMyBundleOrders);
router.get('/:id', authenticate, getBundleOrder);
router.put('/:id/deliver/:productId', authenticate, authorize('seller', 'admin'), deliverBundleCredential);

export default router;
