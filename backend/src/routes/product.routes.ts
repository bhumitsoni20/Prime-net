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
router.get('/seller/me', getSellerProducts);
router.get('/:id', getProduct);
router.post(
  '/',
  authenticate,
  authorize('seller', 'admin'),
  validate(['title', 'category', 'price']),
  createProduct
);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
