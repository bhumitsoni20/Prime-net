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
import mongoose from 'mongoose';

// POST /api/payments/razorpay/create-order
export const razorpayCreateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { productIds = [], bundleId, bundleIds = [] } = req.body;

    let subtotal = 0;
    const finalBundleIds = bundleId ? [bundleId] : (bundleIds || []);

    if (productIds.length > 0) {
      const products = await Product.find({ _id: { $in: productIds } });
      const productMap = new Map(products.map(p => [p._id.toString(), p]));
      
      for (const id of productIds) {
        const p = productMap.get(id.toString());
        if (!p) {
          return sendError(res, `Product not found: ${id}`, 404);
        }
        subtotal += p.price;
      }
    }

    if (finalBundleIds.length > 0) {
      const bundles = await mongoose.model('Bundle').find({ _id: { $in: finalBundleIds } });
      const bundleMap = new Map(bundles.map((b: any) => [b._id.toString(), b]));
      
      for (const id of finalBundleIds) {
        const b = bundleMap.get(id.toString());
        if (!b) {
          return sendError(res, `Bundle not found: ${id}`, 404);
        }
        subtotal += b.bundlePrice;
      }
    }

    if (productIds.length === 0 && finalBundleIds.length === 0) {
      return sendError(res, 'Product IDs or Bundle IDs are required.', 400);
    }

    const platformFee = subtotal * 0.02;
    const totalAmount = subtotal + platformFee;

    const razorpayOrder = await createRazorpayOrder(totalAmount);

    return sendSuccess(res, {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      ...(bundleId ? { bundleId } : { productIds }),
    });
  } catch (error: any) {
    logger.error('Razorpay order creation failed:', error);
    return sendError(res, 'Failed to create payment order.');
  }
};

// POST /api/payments/razorpay/verify
export const razorpayVerify = async (req: AuthRequest, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderIds = [], bundleOrderIds = [], isBundle } = req.body;

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return sendError(res, 'Payment verification failed.', 400);
    }

    const productOrders = isBundle ? [] : orderIds;
    const bundleOrders = isBundle ? orderIds : bundleOrderIds;

    if (productOrders.length === 0 && bundleOrders.length === 0) {
      return sendError(res, 'Order IDs are required.', 400);
    }

    if (bundleOrders.length > 0) {
      const BundleOrder = mongoose.model('BundleOrder');
      await BundleOrder.updateMany(
        { _id: { $in: bundleOrders } },
        {
          $set: {
            paymentStatus: 'paid',
            paymentId: razorpay_payment_id,
          }
        }
      );
      
      const firstOrder: any = await BundleOrder.findById(bundleOrders[0]);
      if (firstOrder) {
        await sendPushNotification(
          firstOrder.user.toString(),
          'Payment Successful!',
          'Your bundle payment has been verified and order confirmed.',
          'payment'
        );
      }
    } 
    
    if (productOrders.length > 0) {
      await Order.updateMany(
        { _id: { $in: productOrders } },
        {
          $set: {
            paymentStatus: 'paid',
            paymentId: razorpay_payment_id,
          }
        }
      );

      const firstOrder = await Order.findById(productOrders[0]);
      if (firstOrder) {
        await sendPushNotification(
          firstOrder.user.toString(),
          'Payment Successful!',
          'Your payment has been verified and order confirmed.',
          'payment'
        );
      }
    }

    return sendSuccess(res, { verified: true }, 'Payment verified successfully.');
  } catch (error: any) {
    logger.error('Razorpay verification failed:', error);
    return sendError(res, 'Payment verification failed.');
  }
};

// POST /api/payments/stripe/create-session
export const stripeCreateSession = async (req: AuthRequest, res: Response) => {
  try {
    const { productIds = [], bundleIds = [], orderIds = [], bundleOrderIds = [] } = req.body;

    if (productIds.length === 0 && bundleIds.length === 0) {
      return sendError(res, 'Products or Bundles are required.', 400);
    }

    const lineItems: any[] = [];
    let subtotal = 0;

    if (productIds.length > 0) {
      const products = await Product.find({ _id: { $in: productIds } });
      products.forEach(p => {
        lineItems.push({
          price_data: {
            currency: 'inr',
            product_data: { name: p.title },
            unit_amount: Math.round(p.price * 100),
          },
          quantity: 1,
        });
        subtotal += p.price;
      });
    }

    if (bundleIds.length > 0) {
      const bundles = await mongoose.model('Bundle').find({ _id: { $in: bundleIds } });
      bundles.forEach((b: any) => {
        lineItems.push({
          price_data: {
            currency: 'inr',
            product_data: { name: b.title },
            unit_amount: Math.round(b.bundlePrice * 100),
          },
          quantity: 1,
        });
        subtotal += b.bundlePrice;
      });
    }

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

    const session = await createStripeSession(lineItems, [...orderIds, ...bundleOrderIds]);

    if (orderIds.length > 0) {
      await Order.updateMany(
        { _id: { $in: orderIds } },
        { $set: { sessionId: session.id } }
      );
    }
    
    if (bundleOrderIds.length > 0) {
      const BundleOrder = mongoose.model('BundleOrder');
      await BundleOrder.updateMany(
        { _id: { $in: bundleOrderIds } },
        { $set: { sessionId: session.id } }
      );
    }

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
          
          // Since Stripe metadata only holds a single orderIds array (max 500 chars),
          // we'll try to update both Order and BundleOrder with these IDs.
          
          await Order.updateMany(
            { _id: { $in: orderIds } },
            {
              $set: {
                paymentStatus: 'paid',
                paymentId: session.payment_intent,
              }
            }
          );
          
          const BundleOrder = mongoose.model('BundleOrder');
          await BundleOrder.updateMany(
            { _id: { $in: orderIds } },
            {
              $set: {
                paymentStatus: 'paid',
                paymentId: session.payment_intent,
              }
            }
          );

          const firstOrder = await Order.findById(orderIds[0]);
          const firstBundleOrder = await BundleOrder.findById(orderIds[0]);
          
          const userId = firstOrder ? firstOrder.user : (firstBundleOrder ? (firstBundleOrder as any).user : null);
          
          if (userId) {
            await sendPushNotification(
              userId.toString(),
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
