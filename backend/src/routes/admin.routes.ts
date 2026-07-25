import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getAllProducts,
  updateProductStatus,
  deleteProduct,
  getAllOrders,
  getApplications,
  updateApplicationStatus,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/products', getAllProducts);
router.put('/products/:id/status', updateProductStatus);
router.delete('/products/:id', deleteProduct);
router.get('/orders', getAllOrders);
router.get('/applications', getApplications);
router.put('/applications/:id/status', updateApplicationStatus);

export default router;
// trigger restart
