import { Router } from 'express';
import express from 'express';
  razorpayCreateOrder,
  razorpayVerify,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Razorpay
router.post('/razorpay/create-order', authenticate, razorpayCreateOrder);
router.post('/razorpay/verify', authenticate, razorpayVerify);



export default router;
