import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
} from '../controllers/product.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', getProducts);
router.get('/seller/me', authenticate, authorize('seller', 'admin'), getSellerProducts);
router.get('/:id', getProduct);
router.post(
  '/',
  authenticate,
  authorize('seller', 'admin'),
  validate(['title', 'category', 'price']),
  createProduct
);
router.put('/:id', authenticate, authorize('seller', 'admin'), updateProduct);
router.delete('/:id', authenticate, authorize('seller', 'admin'), deleteProduct);

export default router;
