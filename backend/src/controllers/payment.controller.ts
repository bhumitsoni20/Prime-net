import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Order } from '../models/Order';
import { BundleOrder } from '../models/BundleOrder';
import { Product } from '../models/Product';
import { Bundle } from '../models/Bundle';
import PaymentVerification from '../models/PaymentVerification';
import PaymentSettings from '../models/PaymentSettings';
import { sendError, sendSuccess } from '../utils/response';
import { logger } from '../utils/logger';

// GET /api/payments/settings
export const getPaymentSettings = async (req: Request, res: Response) => {
  try {
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = await PaymentSettings.create({});
    }
    return sendSuccess(res, settings);
  } catch (error: any) {
    logger.error('Error fetching payment settings:', error);
    return sendError(res, 'Could not fetch payment settings', 500);
  }
};

// POST /api/payments/submit-proof
export const submitPaymentProof = async (req: AuthRequest, res: Response) => {
  try {
    const { orderIds = [], bundleOrderIds = [], screenshot, upiReference } = req.body;
    require('fs').appendFileSync('debug.log', JSON.stringify({ orderIds, bundleOrderIds }) + '\n');

    if (!screenshot) {
      return sendError(res, 'Payment screenshot is required.', 400);
    }

    if (orderIds.length === 0 && bundleOrderIds.length === 0) {
      return sendError(res, 'No orders provided for verification.', 400);
    }

    // Handle normal orders
    for (const orderId of orderIds) {
      const order = await Order.findById(orderId);
      if (!order) continue;
      if (order.user.toString() !== req.user._id.toString()) continue;

      if (order.paymentStatus === 'payment_verified') {
        continue; // Already verified
      }
      
      // If there is an existing verification pending, we could skip, but let's allow overwrite if rejected
      const existingVerification = await PaymentVerification.findOne({ orderId, status: 'pending_verification' });
      if (existingVerification) {
        continue;
      }

      // ATOMIC LISTING REMOVAL
      const product = await Product.findOneAndUpdate(
        { _id: order.product, status: 'active' },
        { status: 'sold' },
        { new: true }
      );
      if (!product) {
        return sendError(res, 'This listing is no longer available. It has already been sold to another buyer.', 409);
      }

      await PaymentVerification.create({
        orderId: order._id,
        orderType: 'Order',
        buyer: req.user._id,
        seller: order.seller,
        amount: order.amount,
        paymentScreenshot: screenshot,
        status: 'pending_verification'
      });

      order.paymentStatus = 'pending_verification';
      await order.save();
    }

    // Handle bundle orders
    for (const bundleOrderId of bundleOrderIds) {
      const bundleOrder = await BundleOrder.findById(bundleOrderId);
      if (!bundleOrder) continue;
      if (bundleOrder.user.toString() !== req.user._id.toString()) continue;

      if (bundleOrder.paymentStatus === 'payment_verified') {
        continue; // Already verified
      }

      const existingVerification = await PaymentVerification.findOne({ orderId: bundleOrderId, status: 'pending_verification' });
      if (existingVerification) {
        continue;
      }

      // ATOMIC LISTING REMOVAL
      const bundle = await Bundle.findOneAndUpdate(
        { _id: bundleOrder.bundle, status: 'active' },
        { status: 'sold' },
        { new: true }
      );
      if (!bundle) {
        return sendError(res, 'This bundle is no longer available. It has already been sold to another buyer.', 409);
      }

      await PaymentVerification.create({
        orderId: bundleOrder._id,
        orderType: 'BundleOrder',
        buyer: req.user._id,
        seller: bundleOrder.seller,
        amount: bundleOrder.amount,
        paymentScreenshot: screenshot,
        status: 'pending_verification'
      });

      bundleOrder.paymentStatus = 'pending_verification';
      await bundleOrder.save();
    }

    const { Cache } = require('../utils/cache');
    Cache.clearAll();

    return sendSuccess(res, null, 'Payment proof submitted successfully. Waiting for admin verification.', 200);
  } catch (error: any) {
    logger.error('Error submitting payment proof:', error);
    return sendError(res, 'Internal server error', 500);
  }
};
