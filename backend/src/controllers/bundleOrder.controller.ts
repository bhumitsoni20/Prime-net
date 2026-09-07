import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { BundleOrder } from '../models/BundleOrder';
import { Bundle } from '../models/Bundle';
import { Coupon } from '../models/Coupon';
import { Message } from '../models/Message';
import { sendSuccess, sendError } from '../utils/response';
import { 
  sendBundlePurchaseConfirmation, 
  sendPartialBundleDelivery, 
  sendBundleCompleteDelivery 
} from '../services/email.service';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import crypto from 'crypto';
import { getIO } from '../socket';

// POST /api/bundle-orders
export const createBundleOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { bundleId, paymentMethod, paymentId, couponCode, cartTotal } = req.body;

    const bundle = await Bundle.findById(bundleId);
    if (!bundle) return sendError(res, 'Bundle not found.', 404);
    if (bundle.status !== 'active') return sendError(res, 'Bundle is not available.', 400);

    // Initial credentials tracking state
    const credentials = bundle.products.map(p => ({
      masterProductId: p.masterProduct,
      deliveryStatus: 'pending' as const,
    }));

    
      let finalAmount = bundle.bundlePrice;
      let discountAmount = 0;
      let appliedCouponId = undefined;
      let finalPaymentStatus: any = paymentMethod === 'coupon' ? 'not_required' : 'paid'; // Current default was 'paid' in BundleOrder, let's keep it or change it

      if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
        if (coupon && coupon.usageCount < coupon.maxUsage) {
          appliedCouponId = coupon._id;
          if (coupon.discountType === 'percentage') {
            discountAmount = (bundle.bundlePrice * coupon.discountValue) / 100;
          } else if (coupon.discountType === 'fixed' && cartTotal) {
            // Proportional discount
            discountAmount = coupon.discountValue * (bundle.bundlePrice / cartTotal);
          } else if (coupon.discountType === 'fixed') {
            discountAmount = coupon.discountValue;
          }

          if (discountAmount > bundle.bundlePrice) discountAmount = bundle.bundlePrice;
          finalAmount = bundle.bundlePrice - discountAmount;
          
          if (finalAmount <= 0) {
            finalAmount = 0;
            finalPaymentStatus = 'not_required';
          }
        }
      }

      const order = await BundleOrder.create({
      user: req.user._id,
      bundle: bundleId,
      seller: bundle.seller,
      amount: finalAmount,
        originalAmount: bundle.bundlePrice,
        discountAmount,
        finalAmount,
        couponCode: appliedCouponId ? couponCode.toUpperCase() : undefined,
        couponId: appliedCouponId,
      paymentMethod,
      paymentId,
      paymentStatus: finalPaymentStatus, // Assuming instant payment for this iteration
      orderStatus: 'placed',
      credentials,
      timeline: [{ status: 'placed', date: new Date() }],
    });

    // Send system message
    await Message.create({
      orderId: order._id,
      onModel: 'BundleOrder',
      senderId: bundle.seller,
      type: 'system',
      content: `Bundle Order placed successfully. Order ID: ${order._id}`,
    });

    const user = await User.findById(req.user._id);
    if (user) {
      await sendBundlePurchaseConfirmation(user.email, user.name, bundle.title);
    }

    return sendSuccess(res, order, 'Bundle order created.', 201);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/bundle-orders
export const getMyBundleOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await BundleOrder.find({ user: req.user._id })
      .populate('bundle', 'title thumbnail bannerImage')
      .populate('seller', 'name avatar')
      .sort('-createdAt');
    return sendSuccess(res, orders);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/bundle-orders/:id
export const getBundleOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await BundleOrder.findById(req.params.id)
      .populate('bundle')
      .populate('user', 'name email avatar')
      .populate('seller', 'name email avatar')
      .populate('credentials.masterProductId', 'name imageUrl');

    if (!order) return sendError(res, 'Bundle Order not found.', 404);

    if (order.user._id.toString() !== req.user._id.toString() && 
        order.seller._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return sendError(res, 'Not authorized.', 403);
    }

    return sendSuccess(res, order);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// PUT /api/bundle-orders/:id/deliver/:masterProductId
export const deliverBundleCredential = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, pin, recoveryEmail, notes } = req.body;
    const { id, masterProductId } = req.params;

    const order = await BundleOrder.findById(id).populate('bundle');
    if (!order) return sendError(res, 'Order not found.', 404);

    if (order.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized.', 403);
    }

    // Find the specific credential slot
    const credIndex = order.credentials.findIndex(c => c.masterProductId.toString() === masterProductId);
    if (credIndex === -1) return sendError(res, 'Product not found in this bundle.', 404);

    const cred = order.credentials[credIndex];
    cred.email = email;
    cred.password = password;
    cred.pin = pin;
    cred.recoveryEmail = recoveryEmail;
    cred.notes = notes;
    cred.deliveryStatus = 'delivered';
    cred.deliveredAt = new Date();

    // Check if all credentials are delivered
    const allDelivered = order.credentials.every(c => c.deliveryStatus === 'delivered');
    const newStatus = allDelivered ? 'completed' : 'partial'; // Auto-complete if all delivered

    if (order.orderStatus !== newStatus) {
      order.orderStatus = newStatus;
      order.timeline.push({ status: newStatus, date: new Date() });
    }

    await order.save();

    // Handle Seller Earnings if bundle is fully completed
    if (allDelivered) {
      try {
        const existingTx = await Transaction.findOne({ order: order._id, type: 'credit' });
        if (!existingTx) {
          const transactionId = 'TXN_' + crypto.randomBytes(8).toString('hex').toUpperCase();
          const grossAmount = order.amount || 0;
          const platformCommission = Number(((grossAmount || 0) * 0.05).toFixed(2)); // Configurable commission
          const netEarning = grossAmount - platformCommission;

          await Transaction.create({
            transactionId,
            order: order._id,
            seller: order.seller,
            grossAmount,
            platformCommission,
            netEarning,
            type: 'credit',
            status: 'completed'
          });

          await User.findByIdAndUpdate(order.seller, {
            $inc: { walletBalance: netEarning }
          });
        }
      } catch (err) {
        console.error('Failed to process seller earning during bundle completion:', err);
      }
    }

    // Create the message payload specifically for this product's credentials
    const message = await Message.create({
      orderId: order._id,
      onModel: 'BundleOrder',
      senderId: req.user._id,
      type: 'bundle_credentials',
      content: `Credentials delivered for product ID: ${masterProductId}`,
      metadata: {
        masterProductId,
        email,
        password,
        pin,
        recoveryEmail,
        notes
      }
    });
    const populatedMessage = await message.populate('senderId', 'name avatar');

    let popSysMsg;
    // Send email notifications (non-blocking — don't let email failures crash the request)
    try {
      const user = await User.findById(order.user);
      if (user) {
        let bundleTitle = 'Bundle';
        
        if (order.bundle) {
          bundleTitle = (order.bundle as any).title || 'Bundle';
        }

        // Fire and forget email notifications to avoid blocking the response
        sendPartialBundleDelivery(user.email, user.name, bundleTitle, 'a product').catch(console.error);
        
        if (allDelivered) {
          const sysMsg = await Message.create({
            orderId: order._id,
            onModel: 'BundleOrder',
            senderId: req.user._id,
            type: 'system',
            content: `Complete Bundle has been delivered.`,
          });
          popSysMsg = await sysMsg.populate('senderId', 'name avatar');
          sendBundleCompleteDelivery(user.email, user.name, bundleTitle).catch(console.error);
        }
      }
    } catch (emailErr) {
      // Log but don't crash
      console.error('Email notification failed:', emailErr);
    }

    try {
      const io = getIO();
      const deliveredCount = order.credentials.filter((c: any) => c.deliveryStatus === 'delivered').length;
      const totalCount = order.credentials.length;

      // Granular Bundle Socket Events
      io.to(`order_${order._id}`).emit('bundle_credential_delivered', {
        orderId: order._id,
        masterProductId,
        cred,
      });

      io.to(`order_${order._id}`).emit('bundle_progress_updated', {
        orderId: order._id,
        deliveredCount,
        totalCount,
        credentials: order.credentials,
        orderStatus: order.orderStatus,
      });

      if (allDelivered) {
        io.to(`order_${order._id}`).emit('bundle_completed', {
          orderId: order._id,
          orderStatus: order.orderStatus,
        });
      }

      const orderIdStr = order._id?.toString();
      const buyerIdStr = order.user?.toString();
      const sellerIdStr = order.seller?.toString();

      io.to(`order_${orderIdStr}`).emit('order_updated', order);
      io.to(`order_${orderIdStr}`).emit('new_message', populatedMessage);
      if (sellerIdStr) io.to(`user_${sellerIdStr}`).emit('new_message', populatedMessage);
      if (buyerIdStr) io.to(`user_${buyerIdStr}`).emit('new_message', populatedMessage);

      if (popSysMsg) {
        io.to(`order_${orderIdStr}`).emit('new_message', popSysMsg);
        if (sellerIdStr) io.to(`user_${sellerIdStr}`).emit('new_message', popSysMsg);
        if (buyerIdStr) io.to(`user_${buyerIdStr}`).emit('new_message', popSysMsg);
      }
    } catch (e) {
      console.error('Socket emit failed:', e);
    }

    return sendSuccess(res, order);
  } catch (error: any) {
    console.error('deliverBundleCredential error:', error);
    return sendError(res, error.message);
  }
};
