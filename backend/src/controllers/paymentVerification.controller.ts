import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import PaymentVerification from '../models/PaymentVerification';
import PaymentSettings from '../models/PaymentSettings';
import { Order } from '../models/Order';
import { BundleOrder } from '../models/BundleOrder';
import { Product } from '../models/Product';
import { Bundle } from '../models/Bundle';
import { sendError, sendSuccess } from '../utils/response';
import { sendPushNotification } from '../services/notification.service';
import { logger } from '../utils/logger';
import { Cache } from '../utils/cache';

export const getVerificationRequests = async (req: Request, res: Response) => {
  try {
    const cacheKey = `admin_verifications_${JSON.stringify(req.query)}`;
    const cachedData = Cache.get(cacheKey);
    if (cachedData) return sendSuccess(res, cachedData);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [verifications, total] = await Promise.all([
      PaymentVerification.find(filter)
        .select('-paymentScreenshot')
        .populate('buyer', 'name email avatar')
        .populate('seller', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PaymentVerification.countDocuments(filter),
    ]);

    // Optimize by extracting orderIds and doing two batch queries
    const orderIds = verifications.filter(v => v.orderType === 'Order').map(v => v.orderId);
    const bundleOrderIds = verifications.filter(v => v.orderType !== 'Order').map(v => v.orderId);

    const [orders, bundleOrders] = await Promise.all([
      Order.find({ _id: { $in: orderIds } }).populate('product', 'title logo').lean(),
      BundleOrder.find({ _id: { $in: bundleOrderIds } }).populate('bundle', 'title logo').lean()
    ]);

    const orderMap = new Map(orders.map(o => [o._id.toString(), o.product]));
    const bundleOrderMap = new Map(bundleOrders.map(b => [b._id.toString(), b.bundle]));

    const enrichedVerifications = verifications.map(v => {
      let productDetails = null;
      if (v.orderType === 'Order') {
        productDetails = orderMap.get(v.orderId?.toString()) || null;
      } else {
        productDetails = bundleOrderMap.get(v.orderId?.toString()) || null;
      }
      return { ...v.toObject(), product: productDetails };
    });

    const result = {
      verifications: enrichedVerifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
    Cache.set(cacheKey, result, 300);

    return sendSuccess(res, result);
  } catch (error: any) {
    logger.error('Error fetching verification requests:', error);
    return sendError(res, 'Could not fetch verifications', 500);
  }
};

export const getVerificationRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const verification = await PaymentVerification.findById(id).lean();
    if (!verification) return sendError(res, 'Verification request not found', 404);
    return sendSuccess(res, verification);
  } catch (error: any) {
    logger.error('Error fetching verification request by ID:', error);
    return sendError(res, 'Internal server error', 500);
  }
};

export const approvePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const verification = await PaymentVerification.findById(id);

    if (!verification) return sendError(res, 'Verification request not found', 404);
    if (verification.status !== 'pending_verification') return sendError(res, 'Already processed', 400);

    if (verification.orderType === 'Order') {
      const order = await Order.findById(verification.orderId).populate('product');
      if (!order) return sendError(res, 'Order not found', 404);
    } else {
      const bundleOrder = await BundleOrder.findById(verification.orderId).populate('bundle');
      if (!bundleOrder) return sendError(res, 'Bundle Order not found', 404);
    }

    // Update Verification Record
    verification.status = 'payment_verified';
    verification.verifiedAt = new Date();
    verification.verifiedBy = req.user._id;
    await verification.save();

    // Update actual Order
    if (verification.orderType === 'Order') {
      const order = await Order.findById(verification.orderId).populate('product');
      if (order) {
        order.paymentStatus = 'payment_verified';
        order.timeline.push({ status: 'payment_verified', date: new Date() });
        await order.save();
        
        // Create system message
        const { Message } = await import('../models/Message');

        // --- AUTOMATED BUYER MESSAGE (ORDER) ---
        const existingAutoMsg = await Message.findOne({
          orderId: order._id,
          'metadata.isAutomatedPurchaseMessage': true
        });

        if (!existingAutoMsg) {
          try {
            const productName = order.product ? (order.product as any).title : 'Product';
            const duration = order.product ? (order.product as any).duration || 'N/A' : 'N/A';
            const price = order.amount || 'N/A';
            
            const autoMessage = await Message.create({
              orderId: order._id,
              onModel: 'Order',
              senderId: order.user,
              content: `Hey, I've purchased ${productName} | Duration: ${duration} | Price: ₹${price}. Please provide the required credentials.`,
              type: 'text',
              status: 'sent',
              metadata: { isAutomatedPurchaseMessage: true }
            });
            const populatedAutoMsg = await autoMessage.populate('senderId', 'name avatar');
            
            try {
              const io = require('../socket').getIO();
              const orderIdStr = order._id?.toString();
              const sellerIdStr = order.seller?.toString();
              const buyerIdStr = order.user?.toString();
              io.to(`order_${orderIdStr}`).emit('new_message', populatedAutoMsg);
              io.to(`user_${sellerIdStr}`).emit('new_message', populatedAutoMsg);
              io.to(`user_${buyerIdStr}`).emit('new_message', populatedAutoMsg);
            } catch (e) {
              console.error('Socket emit error for auto message:', e);
            }
          } catch (err: any) {
            require('fs').appendFileSync('D:/streamkart/backend/auto_msg_error.log', new Date().toISOString() + ' ' + err.stack + '\n');
            console.error('Failed to create auto message', err);
          }
        }
        // --- END AUTOMATED BUYER MESSAGE ---

        const message = await Message.create({
          orderId: order._id,
          onModel: 'Order',
          senderId: order.seller, // Set to seller so buyer gets unread badge
          content: 'Payment manually verified. Waiting for seller to share credentials.',
          type: 'system',
          status: 'sent'
        });
        const populatedMessage = await message.populate('senderId', 'name avatar');
        import('../socket').then(({ getIO }) => {
          try {
            const io = getIO();
            const buyerIdStr = order.user?.toString();
            const sellerIdStr = order.seller?.toString();
            const orderIdStr = order._id?.toString();

            io.to(`order_${orderIdStr}`).emit('new_message', populatedMessage);
            io.to(`user_${sellerIdStr}`).emit('new_message', populatedMessage);
            io.to(`user_${buyerIdStr}`).emit('new_message', populatedMessage);
            io.emit('payment_verified_redirect', { orderId: orderIdStr, userId: buyerIdStr });
          } catch (e) {
            console.error('Socket emit error:', e);
          }
        });

        sendPushNotification(
          order.seller.toString(),
          'Payment Received!',
          `Payment of ₹${order.amount} verified for ${order.product ? (order.product as any).title : 'Product'}.`,
          'payment'
        ).catch(e => logger.error('Push error:', e));
        
        sendPushNotification(
          order.user.toString(),
          'Payment verification completed',
          `Your payment for ${order.product ? (order.product as any).title : 'Product'} has been verified successfully. Click to go to chat.`,
          'order',
          `/dashboard/chats/${order._id}`
        ).catch(e => logger.error('Push error:', e));
      }
    } else {
      const bundleOrder = await BundleOrder.findById(verification.orderId).populate('bundle');
      if (bundleOrder) {
        bundleOrder.paymentStatus = 'payment_verified';
        bundleOrder.timeline.push({ status: 'payment_verified', date: new Date() });
        await bundleOrder.save();

        // Create system message
        const { Message } = await import('../models/Message');

        // --- AUTOMATED BUYER MESSAGE (BUNDLE) ---
        const existingBundleAutoMsg = await Message.findOne({
          orderId: bundleOrder._id,
          'metadata.isAutomatedPurchaseMessage': true
        });

        if (!existingBundleAutoMsg) {
          try {
            const bundleName = bundleOrder.bundle ? (bundleOrder.bundle as any).title : 'Bundle';
            const price = bundleOrder.amount || 'N/A';
            
            const autoMessageBundle = await Message.create({
              orderId: bundleOrder._id,
              onModel: 'BundleOrder',
              senderId: bundleOrder.user,
              content: `Hey, I've purchased ${bundleName} | Price: ₹${price}. Please provide the required credentials.`,
              type: 'text',
              status: 'sent',
              metadata: { isAutomatedPurchaseMessage: true }
            });
            const populatedAutoMsgBundle = await autoMessageBundle.populate('senderId', 'name avatar');
            
            try {
              const io = require('../socket').getIO();
              const orderIdStr = bundleOrder._id?.toString();
              const sellerIdStr = bundleOrder.seller?.toString();
              const buyerIdStr = bundleOrder.user?.toString();
              io.to(`order_${orderIdStr}`).emit('new_message', populatedAutoMsgBundle);
              io.to(`user_${sellerIdStr}`).emit('new_message', populatedAutoMsgBundle);
              io.to(`user_${buyerIdStr}`).emit('new_message', populatedAutoMsgBundle);
            } catch (e) {
              console.error('Socket emit error for bundle auto message:', e);
            }
          } catch (err: any) {
            require('fs').appendFileSync('D:/streamkart/backend/auto_msg_error.log', new Date().toISOString() + ' ' + err.stack + '\n');
            console.error('Failed to create bundle auto message', err);
          }
        }
        // --- END AUTOMATED BUYER MESSAGE ---

        const message = await Message.create({
          orderId: bundleOrder._id,
          onModel: 'BundleOrder',
          senderId: bundleOrder.seller, // Set to seller so buyer gets unread badge
          content: 'Payment manually verified. Waiting for seller to share credentials.',
          type: 'system',
          status: 'sent'
        });
        const populatedMessage = await message.populate('senderId', 'name avatar');
        import('../socket').then(({ getIO }) => {
          try {
            const io = getIO();
            const buyerIdStr = bundleOrder.user?.toString();
            const sellerIdStr = bundleOrder.seller?.toString();
            const orderIdStr = bundleOrder._id?.toString();

            io.to(`order_${orderIdStr}`).emit('new_message', populatedMessage);
            io.to(`user_${sellerIdStr}`).emit('new_message', populatedMessage);
            io.to(`user_${buyerIdStr}`).emit('new_message', populatedMessage);
            io.emit('payment_verified_redirect', { orderId: orderIdStr, userId: buyerIdStr });
          } catch (e) {
            console.error('Socket emit error:', e);
          }
        });

        sendPushNotification(
          bundleOrder.seller.toString(),
          'Bundle Payment Received!',
          `Payment of ₹${bundleOrder.amount} verified for ${bundleOrder.bundle ? (bundleOrder.bundle as any).title : 'Bundle'}.`,
          'payment'
        ).catch(e => logger.error('Push error:', e));
        
        sendPushNotification(
          bundleOrder.user.toString(),
          'Payment verification completed',
          `Your payment for ${bundleOrder.bundle ? (bundleOrder.bundle as any).title : 'Bundle'} has been verified successfully. Click to go to chat.`,
          'order',
          `/dashboard/chats/${bundleOrder._id}`
        ).catch(e => logger.error('Push error:', e));
      }
    }

    Cache.clearAll();
    return sendSuccess(res, verification, 'Payment approved successfully.');
  } catch (error: any) {
    logger.error('Error approving payment:', error);
    return sendError(res, 'Internal server error', 500);
  }
};

export const rejectPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) return sendError(res, 'Rejection reason is required.', 400);

    const verification = await PaymentVerification.findById(id);

    if (!verification) return sendError(res, 'Verification request not found', 404);
    if (verification.status !== 'pending_verification') return sendError(res, 'Already processed', 400);

    // Update Verification Record
    verification.status = 'payment_rejected';
    verification.rejectionReason = rejectionReason;
    verification.verifiedAt = new Date();
    verification.verifiedBy = req.user._id;
    await verification.save();

    let productName = 'Order';
    // Update actual Order
    if (verification.orderType === 'Order') {
      const order = await Order.findById(verification.orderId).populate('product');
      if (order) {
        order.paymentStatus = 'payment_rejected';
        order.timeline.push({ status: 'payment_rejected', date: new Date() });
        await order.save();
        
        // Restore listing to active since payment was rejected
        if (order.product) {
          await Product.findByIdAndUpdate((order.product as any)._id, { status: 'active' });
        }
        
        productName = order.product ? (order.product as any).title : 'Product';
      }
    } else {
      const bundleOrder = await BundleOrder.findById(verification.orderId).populate('bundle');
      if (bundleOrder) {
        bundleOrder.paymentStatus = 'payment_rejected';
        bundleOrder.timeline.push({ status: 'payment_rejected', date: new Date() });
        await bundleOrder.save();

        // Restore listing to active since payment was rejected
        if (bundleOrder.bundle) {
          await Bundle.findByIdAndUpdate((bundleOrder.bundle as any)._id, { status: 'active' });
        }

        productName = bundleOrder.bundle ? (bundleOrder.bundle as any).title : 'Bundle';
      }
    }

    import('../socket').then(({ getIO }) => {
      try {
        const io = getIO();
        const buyerIdStr = verification.buyer?.toString();
        const orderIdStr = verification.orderId?.toString();
        const payload = {
          orderId: orderIdStr,
          orderType: verification.orderType,
          rejectionReason,
          productName,
          buyerId: buyerIdStr,
        };

        if (buyerIdStr) io.to(`user_${buyerIdStr}`).emit('payment_rejected_popup', payload);
        io.emit('payment_rejected_popup', payload);
      } catch (e) {
        console.error('Socket emit error on reject:', e);
      }
    });

    sendPushNotification(
      verification.buyer.toString(),
      'Payment verification failed',
      `Your payment for ${productName} could not be verified. Reason: ${rejectionReason}`,
      'order',
      `/checkout`
    ).catch(e => logger.error('Push error:', e));

    Cache.clearAll();
    return sendSuccess(res, verification, 'Payment rejected successfully.');
  } catch (error: any) {
    logger.error('Error rejecting payment:', error);
    return sendError(res, 'Internal server error', 500);
  }
};

export const updatePaymentSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { upiId, accountName, instructions, qrCode } = req.body;
    
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = new PaymentSettings({});
    }

    if (upiId !== undefined) settings.upiId = upiId;
    if (accountName !== undefined) settings.accountName = accountName;
    if (instructions !== undefined) settings.instructions = instructions;
    if (qrCode !== undefined) settings.qrCode = qrCode; // Should be base64 string from UI
    
    settings.updatedBy = req.user._id;
    await settings.save();

    Cache.clearAll();
    return sendSuccess(res, settings, 'Payment settings updated successfully.');
  } catch (error: any) {
    logger.error('Error updating payment settings:', error);
    return sendError(res, 'Internal server error', 500);
  }
};
