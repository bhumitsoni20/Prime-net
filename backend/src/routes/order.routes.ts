import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getSellerOrders,
  getOrder,
  updateOrderStatus,
  getOrderChat,
  sendOrderMessage,
  deliverOrderCredentials,
  markMessagesSeen,
  getMyChats
} from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

router.post('/', authenticate, createOrder);
router.get('/', authenticate, getMyOrders);
router.get('/chats', authenticate, getMyChats);
router.get('/seller/me', authenticate, authorize('seller', 'admin'), getSellerOrders);
router.get('/:id', authenticate, getOrder);
router.put('/:id/status', authenticate, updateOrderStatus);
router.get('/:id/chat', authenticate, getOrderChat);
router.post('/:id/chat', authenticate, sendOrderMessage);
router.put('/:id/deliver', authenticate, authorize('seller', 'admin'), deliverOrderCredentials);
router.put('/:id/seen', authenticate, markMessagesSeen);

export default router;
