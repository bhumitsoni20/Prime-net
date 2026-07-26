import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  createStripeSession,
  verifyStripeWebhook,
} from '../services/payment.service';
import { sendPushNotification } from '../services/notification.service';
import { sendSuccess, sendError } from '../utils/response';
import { logger } from '../utils/logger';

// POST /api/payments/razorpay/create-order
export const razorpayCreateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return sendError(res, 'Product IDs are required.', 400);
    }

    const products = await Product.find({ _id: { $in: productIds } });
    
    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    let subtotal = 0;
    
    for (const id of productIds) {
      const p = productMap.get(id.toString());
      if (!p) {
        return sendError(res, `Product not found: ${id}`, 404);
      }
      subtotal += p.price;
    }

    const platformFee = subtotal * 0.02;
    const totalAmount = subtotal + platformFee;

    const razorpayOrder = await createRazorpayOrder(totalAmount);

    return sendSuccess(res, {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      productIds: products.map(p => p._id),
    });
  } catch (error: any) {
    logger.error('Razorpay order creation failed:', error);
    return sendError(res, 'Failed to create payment order.');
  }
};

// POST /api/payments/razorpay/verify
export const razorpayVerify = async (req: AuthRequest, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderIds } = req.body;

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return sendError(res, 'Payment verification failed.', 400);
    }

    if (!orderIds || !Array.isArray(orderIds)) {
      return sendError(res, 'Order IDs are required.', 400);
    }

    await Order.updateMany(
      { _id: { $in: orderIds } },
      {
        $set: {
          paymentStatus: 'paid',
          paymentId: razorpay_payment_id,
        }
      }
    );

    const firstOrder = await Order.findById(orderIds[0]);
    if (firstOrder) {
      await sendPushNotification(
        firstOrder.user.toString(),
        'Payment Successful!',
        'Your payment has been verified and order confirmed.',
        'payment'
      );
    }

    return sendSuccess(res, null, 'Payment verified successfully.');
  } catch (error: any) {
    logger.error('Razorpay verification failed:', error);
    return sendError(res, 'Payment verification failed.');
  }
};

// POST /api/payments/stripe/create-session
export const stripeCreateSession = async (req: AuthRequest, res: Response) => {
  try {
    const { productIds, orderIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || !orderIds || !Array.isArray(orderIds)) {
      return sendError(res, 'productIds and orderIds arrays are required.', 400);
    }

    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length === 0) return sendError(res, 'Products not found.', 404);

    const lineItems = products.map((p) => ({
      price_data: {
        currency: 'inr',
        product_data: { name: p.title },
        unit_amount: Math.round(p.price * 100),
      },
      quantity: 1,
    }));

    // Add Platform Fee as a separate line item
    const subtotal = products.reduce((acc, p) => acc + p.price, 0);
    const platformFee = Math.round(subtotal * 0.02 * 100);

    if (platformFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: { name: 'Platform Fee (2%)' },
          unit_amount: platformFee,
        },
        quantity: 1,
      });
    }

    const session = await createStripeSession(lineItems, orderIds);

    // Update orders with session ID
    await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { sessionId: session.id } }
    );

    return sendSuccess(res, { sessionUrl: session.url, sessionId: session.id });
  } catch (error: any) {
    logger.error('Stripe session creation failed:', error);
    return sendError(res, 'Failed to create payment session.');
  }
};

// POST /api/payments/stripe/webhook
export const stripeWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const event = verifyStripeWebhook(req.body, signature);

    if (!event) {
      return sendError(res, 'Webhook signature verification failed.', 400);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const orderIdsStr = session.metadata?.orderIds;

      if (orderIdsStr) {
        try {
          const orderIds = JSON.parse(orderIdsStr);
          await Order.updateMany(
            { _id: { $in: orderIds } },
            {
              $set: {
                paymentStatus: 'paid',
                paymentId: session.payment_intent,
              }
            }
          );

          const firstOrder = await Order.findById(orderIds[0]);
          if (firstOrder) {
            await sendPushNotification(
              firstOrder.user.toString(),
              'Payment Successful!',
              'Your Stripe payment has been confirmed.',
              'payment'
            );
          }
        } catch (e) {
          logger.error('Failed to parse orderIds from metadata:', e);
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    logger.error('Stripe webhook error:', error);
    return sendError(res, 'Webhook processing failed.');
  }
};
