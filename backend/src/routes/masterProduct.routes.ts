import { Router } from 'express';
import {
  getMasterProducts,
  getMasterProductById,
  createMasterProduct,
  updateMasterProduct,
  updateMasterProductStatus,
  deleteMasterProduct,
} from '../controllers/masterProduct.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

// Public / Seller routes (Sellers can get active master products)
router.get('/', getMasterProducts);
router.get('/:id', getMasterProductById);

// Admin-only routes
router.use(authenticate);
router.use(authorize('admin'));

router.post('/', createMasterProduct);
router.put('/:id', updateMasterProduct);
router.patch('/:id/status', updateMasterProductStatus);
router.delete('/:id', deleteMasterProduct);

export default router;
