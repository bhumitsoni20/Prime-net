import express from 'express';
import {
  createRequest,
  getUserRequests,
  getAllRequests,
  updateRequestStatus,
  expressInterest,
  fulfillRequest,
} from '../controllers/productRequest.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = express.Router();

// User routes
router.post('/', authenticate, createRequest);
router.get('/me', authenticate, getUserRequests);

// Seller/Admin routes
router.get('/', authenticate, authorize('admin', 'seller'), getAllRequests);
router.post('/:id/interest', authenticate, authorize('seller', 'admin'), expressInterest);

// Admin only routes
router.put('/:id/status', authenticate, authorize('admin'), updateRequestStatus);
router.put('/:id/fulfill', authenticate, authorize('admin'), fulfillRequest);

export default router;
