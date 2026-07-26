import { razorpayInstance } from '../config/razorpay';
import { stripe } from '../config/stripe';
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

// ─── Stripe ─────────────────────────────────────────────

export const createStripeSession = async (
  lineItems: any[],
  orderIds: string[],
  currency = 'inr'
) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&orders=${orderIds.join(',')}`,
    cancel_url: `${env.CLIENT_URL}/payment/cancel`,
    metadata: { orderIds: JSON.stringify(orderIds) },
  });

  return session;
};

export const verifyStripeWebhook = (payload: string | Buffer, signature: string) => {
  try {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      logger.warn('STRIPE_WEBHOOK_SECRET not set, bypassing verification for local dev');
      return JSON.parse(payload.toString());
    }
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    logger.error('Stripe webhook verification failed:', error);
    return null;
  }
};
