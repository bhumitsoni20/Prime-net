import express from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { getBundles, getBundle, createBundle, updateBundle, deleteBundle, getSellerBundles, getAdminBundles } from '../controllers/bundle.controller';

const router = express.Router();

router.get('/', getBundles);
router.get('/seller', authenticate, authorize('seller', 'admin'), getSellerBundles);
router.get('/admin', authenticate, authorize('admin'), getAdminBundles);
router.get('/:id', getBundle);

router.post('/', authenticate, authorize('seller', 'admin'), createBundle);
router.put('/:id', authenticate, authorize('seller', 'admin'), updateBundle);
router.delete('/:id', authenticate, authorize('seller', 'admin'), deleteBundle);

export default router;
