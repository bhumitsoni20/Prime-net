import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import PaymentVerification from '../models/PaymentVerification';
import PaymentSettings from '../models/PaymentSettings';
import { Order } from '../models/Order';
import { BundleOrder } from '../models/BundleOrder';
import { sendError, sendSuccess } from '../utils/response';
import { sendPushNotification } from '../services/notification.service';
import { logger } from '../utils/logger';

export const getVerificationRequests = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [verifications, total] = await Promise.all([
      PaymentVerification.find(filter)
        .populate('buyer', 'name email avatar')
        .populate('seller', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PaymentVerification.countDocuments(filter),
    ]);

    // Also fetch related product info dynamically (for preview)
    const enrichedVerifications = await Promise.all(verifications.map(async (v) => {
      let productDetails = null;
      if (v.orderType === 'Order') {
        const order = await Order.findById(v.orderId).populate('product', 'title logo');
        if (order) productDetails = order.product;
      } else {
        const bundleOrder = await BundleOrder.findById(v.orderId).populate('bundle', 'title logo');
        if (bundleOrder) productDetails = bundleOrder.bundle;
      }
      return { ...v.toObject(), product: productDetails };
    }));

    return sendSuccess(res, {
      verifications: enrichedVerifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    logger.error('Error fetching verification requests:', error);
    return sendError(res, 'Could not fetch verifications', 500);
  }
};

export const approvePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const verification = await PaymentVerification.findById(id);

    if (!verification) return sendError(res, 'Verification request not found', 404);
    if (verification.status !== 'pending_verification') return sendError(res, 'Already processed', 400);

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

        await sendPushNotification(
          order.seller.toString(),
          'Payment Received!',
          `Payment of ₹${order.amount} verified for ${order.product ? (order.product as any).title : 'Product'}.`,
          'payment'
        );
        await sendPushNotification(
          order.user.toString(),
          'Payment verification completed',
          `Your payment for ${order.product ? (order.product as any).title : 'Product'} has been verified successfully. Click to go to chat.`,
          'order',
          `/dashboard/chats/${order._id}`
        );
      }
    } else {
      const bundleOrder = await BundleOrder.findById(verification.orderId).populate('bundle');
      if (bundleOrder) {
        bundleOrder.paymentStatus = 'payment_verified';
        bundleOrder.timeline.push({ status: 'payment_verified', date: new Date() });
        await bundleOrder.save();

        // Create system message
        const { Message } = await import('../models/Message');
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

        await sendPushNotification(
          bundleOrder.seller.toString(),
          'Bundle Payment Received!',
          `Payment of ₹${bundleOrder.amount} verified for ${bundleOrder.bundle ? (bundleOrder.bundle as any).title : 'Bundle'}.`,
          'payment'
        );
        await sendPushNotification(
          bundleOrder.user.toString(),
          'Payment verification completed',
          `Your payment for ${bundleOrder.bundle ? (bundleOrder.bundle as any).title : 'Bundle'} has been verified successfully. Click to go to chat.`,
          'order',
          `/dashboard/chats/${bundleOrder._id}`
        );
      }
    }

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
        productName = order.product ? (order.product as any).title : 'Product';
      }
    } else {
      const bundleOrder = await BundleOrder.findById(verification.orderId).populate('bundle');
      if (bundleOrder) {
        bundleOrder.paymentStatus = 'payment_rejected';
        bundleOrder.timeline.push({ status: 'payment_rejected', date: new Date() });
        await bundleOrder.save();
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

    await sendPushNotification(
      verification.buyer.toString(),
      'Payment verification failed',
      `Your payment for ${productName} could not be verified. Reason: ${rejectionReason}`,
      'order',
      `/checkout`
    );

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

    return sendSuccess(res, settings, 'Payment settings updated successfully.');
  } catch (error: any) {
    logger.error('Error updating payment settings:', error);
    return sendError(res, 'Internal server error', 500);
  }
};
