import { razorpayInstance } from '../config/razorpay';

import { env } from '../config/env';
import crypto from 'crypto';
import { logger } from '../utils/logger';

// ─── Razorpay ───────────────────────────────────────────

export const createRazorpayOrder = async (amount: number, currency = 'INR') => {
  const options = {
    amount: amount * 100,
    currency,
    receipt: `receipt_${Date.now()}`,
  };

  const order = await razorpayInstance.orders.create(options);
  return order;
};

export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};


