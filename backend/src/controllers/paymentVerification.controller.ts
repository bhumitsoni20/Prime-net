import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import PaymentVerification from '../models/PaymentVerification';
import PaymentSettings from '../models/PaymentSettings';
import { Order } from '../models/Order';
import { BundleOrder } from '../models/BundleOrder';
import { Product } from '../models/Product';
import { Bundle } from '../models/Bundle';
import { Message } from '../models/Message';
import { sendError, sendSuccess } from '../utils/response';
import { sendPushNotification } from '../services/notification.service';
import { logger } from '../utils/logger';
import { Cache } from '../utils/cache';
import { getIO } from '../socket';

export const getVerificationRequests = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const cacheKey = `admin_verifications_${JSON.stringify(req.query)}`;
    const cachedData = Cache.get(cacheKey);
    if (cachedData) return sendSuccess(res, cachedData);

    const [verifications, total] = await Promise.all([
      PaymentVerification.find(filter)
        .select('-paymentScreenshot')
        .populate('buyer', 'name email avatar')
        .populate('seller', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PaymentVerification.countDocuments(filter),
    ]);

    // Batch query order products
    const orderIds = verifications.filter((v) => v.orderType === 'Order').map((v) => v.orderId);
    const bundleOrderIds = verifications.filter((v) => v.orderType !== 'Order').map((v) => v.orderId);

    const [orders, bundleOrders] = await Promise.all([
      orderIds.length > 0 ? Order.find({ _id: { $in: orderIds } }).populate('product', 'title logo').lean() : [],
      bundleOrderIds.length > 0
        ? BundleOrder.find({ _id: { $in: bundleOrderIds } }).populate('bundle', 'title logo').lean()
        : [],
    ]);

    const orderMap = new Map(orders.map((o: any) => [o._id.toString(), o.product]));
    const bundleOrderMap = new Map(bundleOrders.map((b: any) => [b._id.toString(), b.bundle]));

    const enrichedVerifications = verifications.map((v: any) => {
      let productDetails = null;
      if (v.orderType === 'Order') {
        productDetails = orderMap.get(v.orderId?.toString()) || null;
      } else {
        productDetails = bundleOrderMap.get(v.orderId?.toString()) || null;
      }
      return { ...v, product: productDetails };
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
    Cache.set(cacheKey, result, 60);

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

    let orderDoc: any = null;
    let bundleOrderDoc: any = null;

    if (verification.orderType === 'Order') {
      orderDoc = await Order.findById(verification.orderId).populate('product');
      if (!orderDoc) return sendError(res, 'Order not found', 404);
    } else {
      bundleOrderDoc = await BundleOrder.findById(verification.orderId).populate('bundle');
      if (!bundleOrderDoc) return sendError(res, 'Bundle Order not found', 404);
    }

    // Update Verification Record
    verification.status = 'payment_verified';
    verification.verifiedAt = new Date();
    verification.verifiedBy = req.user._id;
    await verification.save();

    // Update actual Order
    if (verification.orderType === 'Order' && orderDoc) {
      orderDoc.paymentStatus = 'payment_verified';
      orderDoc.timeline.push({ status: 'payment_verified', date: new Date() });
      await orderDoc.save();

      // --- AUTOMATED BUYER MESSAGE (ORDER) ---
      const existingAutoMsg = await Message.findOne({
        orderId: orderDoc._id,
        'metadata.isAutomatedPurchaseMessage': true,
      });

      if (!existingAutoMsg) {
        try {
          const productName = orderDoc.product ? (orderDoc.product as any).title : 'Product';
          const duration = orderDoc.product ? (orderDoc.product as any).duration || 'N/A' : 'N/A';
          const price = orderDoc.amount || 'N/A';

          const autoMessage = await Message.create({
            orderId: orderDoc._id,
            onModel: 'Order',
            senderId: orderDoc.user,
            content: `Hey, I've purchased ${productName} | Duration: ${duration} | Price: ₹${price}. Please provide the required credentials.`,
            type: 'text',
            status: 'sent',
            metadata: { isAutomatedPurchaseMessage: true },
          });
          const populatedAutoMsg = await autoMessage.populate('senderId', 'name avatar');

          try {
            const io = getIO();
            const orderIdStr = orderDoc._id?.toString();
            const sellerIdStr = orderDoc.seller?.toString();
            const buyerIdStr = orderDoc.user?.toString();
            io.to(`order_${orderIdStr}`).emit('new_message', populatedAutoMsg);
            io.to(`user_${sellerIdStr}`).emit('new_message', populatedAutoMsg);
            io.to(`user_${buyerIdStr}`).emit('new_message', populatedAutoMsg);
          } catch (e) {
            console.error('Socket emit error for auto message:', e);
          }
        } catch (err: any) {
          console.error('Failed to create auto message', err);
        }
      }

      const message = await Message.create({
        orderId: orderDoc._id,
        onModel: 'Order',
        senderId: orderDoc.seller,
        content: 'Payment manually verified. Waiting for seller to share credentials.',
        type: 'system',
        status: 'sent',
      });
      const populatedMessage = await message.populate('senderId', 'name avatar');

      try {
        const io = getIO();
        const buyerIdStr = orderDoc.user?.toString();
        const sellerIdStr = orderDoc.seller?.toString();
        const orderIdStr = orderDoc._id?.toString();

        io.to(`order_${orderIdStr}`).emit('new_message', populatedMessage);
        io.to(`user_${sellerIdStr}`).emit('new_message', populatedMessage);
        io.to(`user_${buyerIdStr}`).emit('new_message', populatedMessage);
        io.emit('payment_verified_redirect', { orderId: orderIdStr, userId: buyerIdStr });
      } catch (e) {
        console.error('Socket emit error:', e);
      }

      sendPushNotification(
        orderDoc.seller.toString(),
        'Payment Received!',
        `Payment of ₹${orderDoc.amount} verified for ${orderDoc.product ? (orderDoc.product as any).title : 'Product'}.`,
        'payment'
      ).catch((e) => logger.error('Push error:', e));

      sendPushNotification(
        orderDoc.user.toString(),
        'Payment verification completed',
        `Your payment for ${orderDoc.product ? (orderDoc.product as any).title : 'Product'} has been verified successfully. Click to go to chat.`,
        'order',
        `/dashboard/chats/${orderDoc._id}`
      ).catch((e) => logger.error('Push error:', e));
    } else if (bundleOrderDoc) {
      bundleOrderDoc.paymentStatus = 'payment_verified';
      bundleOrderDoc.timeline.push({ status: 'payment_verified', date: new Date() });
      await bundleOrderDoc.save();

      // --- AUTOMATED BUYER MESSAGE (BUNDLE) ---
      const existingBundleAutoMsg = await Message.findOne({
        orderId: bundleOrderDoc._id,
        'metadata.isAutomatedPurchaseMessage': true,
      });

      if (!existingBundleAutoMsg) {
        try {
          const bundleName = bundleOrderDoc.bundle ? (bundleOrderDoc.bundle as any).title : 'Bundle';
          const price = bundleOrderDoc.amount || 'N/A';

          const autoMessageBundle = await Message.create({
            orderId: bundleOrderDoc._id,
            onModel: 'BundleOrder',
            senderId: bundleOrderDoc.user,
            content: `Hey, I've purchased ${bundleName} | Price: ₹${price}. Please provide the required credentials.`,
            type: 'text',
            status: 'sent',
            metadata: { isAutomatedPurchaseMessage: true },
          });
          const populatedAutoMsgBundle = await autoMessageBundle.populate('senderId', 'name avatar');

          try {
            const io = getIO();
            const orderIdStr = bundleOrderDoc._id?.toString();
            const sellerIdStr = bundleOrderDoc.seller?.toString();
            const buyerIdStr = bundleOrderDoc.user?.toString();
            io.to(`order_${orderIdStr}`).emit('new_message', populatedAutoMsgBundle);
            io.to(`user_${sellerIdStr}`).emit('new_message', populatedAutoMsgBundle);
            io.to(`user_${buyerIdStr}`).emit('new_message', populatedAutoMsgBundle);
          } catch (e) {
            console.error('Socket emit error for bundle auto message:', e);
          }
        } catch (err: any) {
          console.error('Failed to create bundle auto message', err);
        }
      }

      const message = await Message.create({
        orderId: bundleOrderDoc._id,
        onModel: 'BundleOrder',
        senderId: bundleOrderDoc.seller,
        content: 'Payment manually verified. Waiting for seller to share credentials.',
        type: 'system',
        status: 'sent',
      });
      const populatedMessage = await message.populate('senderId', 'name avatar');

      try {
        const io = getIO();
        const buyerIdStr = bundleOrderDoc.user?.toString();
        const sellerIdStr = bundleOrderDoc.seller?.toString();
        const orderIdStr = bundleOrderDoc._id?.toString();

        io.to(`order_${orderIdStr}`).emit('new_message', populatedMessage);
        io.to(`user_${sellerIdStr}`).emit('new_message', populatedMessage);
        io.to(`user_${buyerIdStr}`).emit('new_message', populatedMessage);
        io.emit('payment_verified_redirect', { orderId: orderIdStr, userId: buyerIdStr });
      } catch (e) {
        console.error('Socket emit error:', e);
      }

      sendPushNotification(
        bundleOrderDoc.seller.toString(),
        'Bundle Payment Received!',
        `Payment of ₹${bundleOrderDoc.amount} verified for ${bundleOrderDoc.bundle ? (bundleOrderDoc.bundle as any).title : 'Bundle'}.`,
        'payment'
      ).catch((e) => logger.error('Push error:', e));

      sendPushNotification(
        bundleOrderDoc.user.toString(),
        'Payment verification completed',
        `Your payment for ${bundleOrderDoc.bundle ? (bundleOrderDoc.bundle as any).title : 'Bundle'} has been verified successfully. Click to go to chat.`,
        'order',
        `/dashboard/chats/${bundleOrderDoc._id}`
      ).catch((e) => logger.error('Push error:', e));
    }

    Cache.invalidatePrefix('admin_verifications_');
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

    sendPushNotification(
      verification.buyer.toString(),
      'Payment verification failed',
      `Your payment for ${productName} could not be verified. Reason: ${rejectionReason}`,
      'order',
      `/checkout`
    ).catch((e) => logger.error('Push error:', e));

    Cache.invalidatePrefix('admin_verifications_');
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
    if (qrCode !== undefined) settings.qrCode = qrCode;

    settings.updatedBy = req.user._id;
    await settings.save();

    Cache.clearAll();
    return sendSuccess(res, settings, 'Payment settings updated successfully.');
  } catch (error: any) {
    logger.error('Error updating payment settings:', error);
    return sendError(res, 'Internal server error', 500);
  }
};
