import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { WalletTopup } from '../models/WalletTopup';
import { BuyerWithdrawal } from '../models/BuyerWithdrawal';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { getIO } from '../socket';
import { sendPushNotification } from '../services/notification.service';
import { logger } from '../utils/logger';

// GET /api/admin/wallet-topups
export const getAdminWalletTopups = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const [topups, total, statsPending, statsCompleted] = await Promise.all([
      WalletTopup.find(filter)
        .select('-paymentScreenshot') // omit heavy base64 in list view
        .populate('user', 'name email avatar phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WalletTopup.countDocuments(filter),
      WalletTopup.aggregate([
        { $match: { status: 'pending_verification' } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$amount' } } },
      ]),
      WalletTopup.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$amount' } } },
      ]),
    ]);

    return res.json({
      success: true,
      data: topups,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
      stats: {
        pendingCount: statsPending[0]?.count || 0,
        pendingTotal: statsPending[0]?.total || 0,
        completedTotal: statsCompleted[0]?.total || 0,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching admin wallet topups:', error);
    return sendError(res, error.message);
  }
};

// GET /api/admin/wallet-topups/:id
export const getAdminWalletTopupById = async (req: AuthRequest, res: Response) => {
  try {
    const topup = await WalletTopup.findById(req.params.id)
      .populate('user', 'name email avatar phone')
      .lean();

    if (!topup) return sendError(res, 'Top-up request not found.', 404);

    return sendSuccess(res, topup);
  } catch (error: any) {
    logger.error('Error fetching wallet topup by ID:', error);
    return sendError(res, error.message);
  }
};

// POST /api/admin/wallet-topups/:id/approve
export const approveWalletTopup = async (req: AuthRequest, res: Response) => {
  try {
    const topup = await WalletTopup.findById(req.params.id);
    if (!topup) return sendError(res, 'Top-up request not found.', 404);
    if (topup.status !== 'pending_verification') {
      return sendError(res, `Top-up request is already ${topup.status}.`, 400);
    }

    // Atomically credit user balance
    const user = await User.findByIdAndUpdate(
      topup.user,
      {
        $inc: { walletBalance: topup.amount },
      },
      { new: true }
    );

    if (!user) return sendError(res, 'User not found.', 404);

    topup.status = 'completed';
    topup.verifiedAt = new Date();
    topup.verifiedBy = req.user._id;
    await topup.save();

    // Real-time socket notification to buyer
    try {
      const io = getIO();
      const userIdStr = topup.user.toString();

      io.to(`user_${userIdStr}`).emit('wallet_updated', {
        walletBalance: user.walletBalance,
        change: topup.amount,
        reason: 'topup_approved',
        topupId: topup._id,
      });

      io.to(`user_${userIdStr}`).emit('wallet_topup_approved', {
        topupId: topup._id,
        amount: topup.amount,
        newBalance: user.walletBalance,
      });
    } catch (e) {
      console.warn('Socket error on topup approval:', e);
    }

    // Fire push notification
    sendPushNotification(
      topup.user.toString(),
      'Wallet Top-Up Approved! 🎉',
      `₹${topup.amount} has been successfully credited to your StreamKart Wallet. Current balance: ₹${user.walletBalance}`,
      'payment'
    ).catch(console.error);

    return sendSuccess(res, { topup, newBalance: user.walletBalance }, 'Wallet top-up approved and balance credited successfully.');
  } catch (error: any) {
    logger.error('Error approving wallet topup:', error);
    return sendError(res, error.message);
  }
};

// POST /api/admin/wallet-topups/:id/reject
export const rejectWalletTopup = async (req: AuthRequest, res: Response) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason || !rejectionReason.trim()) {
      return sendError(res, 'Please provide a reason for rejecting the top-up.', 400);
    }

    const topup = await WalletTopup.findById(req.params.id);
    if (!topup) return sendError(res, 'Top-up request not found.', 404);
    if (topup.status !== 'pending_verification') {
      return sendError(res, `Top-up request is already ${topup.status}.`, 400);
    }

    topup.status = 'rejected';
    topup.rejectionReason = rejectionReason.trim();
    topup.verifiedAt = new Date();
    topup.verifiedBy = req.user._id;
    await topup.save();

    // Real-time socket notification to buyer
    try {
      const io = getIO();
      const userIdStr = topup.user.toString();

      io.to(`user_${userIdStr}`).emit('wallet_topup_rejected', {
        topupId: topup._id,
        amount: topup.amount,
        rejectionReason: topup.rejectionReason,
      });
    } catch (e) {
      console.warn('Socket error on topup rejection:', e);
    }

    // Fire push notification
    sendPushNotification(
      topup.user.toString(),
      'Wallet Top-Up Rejected',
      `Your wallet top-up of ₹${topup.amount} was rejected: ${topup.rejectionReason}`,
      'payment'
    ).catch(console.error);

    return sendSuccess(res, topup, 'Wallet top-up rejected.');
  } catch (error: any) {
    logger.error('Error rejecting wallet topup:', error);
    return sendError(res, error.message);
  }
};

// GET /api/admin/buyer-refunds
export const getAdminBuyerRefunds = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const [refunds, total, statsPending, statsCompleted] = await Promise.all([
      BuyerWithdrawal.find(filter)
        .populate('user', 'name email avatar phone walletBalance')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BuyerWithdrawal.countDocuments(filter),
      BuyerWithdrawal.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$amount' } } },
      ]),
      BuyerWithdrawal.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$amount' } } },
      ]),
    ]);

    return res.json({
      success: true,
      data: refunds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
      stats: {
        pendingCount: statsPending[0]?.count || 0,
        pendingTotal: statsPending[0]?.total || 0,
        completedTotal: statsCompleted[0]?.total || 0,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching admin buyer refunds:', error);
    return sendError(res, error.message);
  }
};

// POST /api/admin/buyer-refunds/:id/approve
export const approveBuyerRefund = async (req: AuthRequest, res: Response) => {
  try {
    const { transactionReference, adminNote } = req.body;

    const refund = await BuyerWithdrawal.findById(req.params.id);
    if (!refund) return sendError(res, 'Refund request not found.', 404);
    if (refund.status !== 'pending') {
      return sendError(res, `Refund request is already ${refund.status}.`, 400);
    }

    refund.status = 'completed';
    refund.transactionReference = (transactionReference || '').trim();
    refund.adminNote = (adminNote || '').trim();
    refund.processedAt = new Date();
    refund.processedBy = req.user._id;
    await refund.save();

    // Real-time socket notification to buyer
    try {
      const io = getIO();
      const userIdStr = refund.user.toString();

      io.to(`user_${userIdStr}`).emit('buyer_refund_approved', {
        refundId: refund._id,
        amount: refund.amount,
        upiId: refund.upiId,
        transactionReference: refund.transactionReference,
      });
    } catch (e) {
      console.warn('Socket error on refund approval:', e);
    }

    // Fire push notification
    sendPushNotification(
      refund.user.toString(),
      'UPI Refund Processed! 💳',
      `Your refund request of ₹${refund.amount} has been successfully sent to ${refund.upiId}.${refund.transactionReference ? ` Ref: ${refund.transactionReference}` : ''}`,
      'payment'
    ).catch(console.error);

    return sendSuccess(res, refund, 'Buyer refund approved and marked as completed.');
  } catch (error: any) {
    logger.error('Error approving buyer refund:', error);
    return sendError(res, error.message);
  }
};

// POST /api/admin/buyer-refunds/:id/reject
export const rejectBuyerRefund = async (req: AuthRequest, res: Response) => {
  try {
    const { rejectionReason, adminNote } = req.body;
    if (!rejectionReason || !rejectionReason.trim()) {
      return sendError(res, 'Please provide a reason for rejecting the refund request.', 400);
    }

    const refund = await BuyerWithdrawal.findById(req.params.id);
    if (!refund) return sendError(res, 'Refund request not found.', 404);
    if (refund.status !== 'pending') {
      return sendError(res, `Refund request is already ${refund.status}.`, 400);
    }

    // Atomically refund the amount back into buyer's wallet balance
    const user = await User.findByIdAndUpdate(
      refund.user,
      {
        $inc: { walletBalance: refund.amount },
      },
      { new: true }
    );

    if (!user) return sendError(res, 'User not found.', 404);

    refund.status = 'rejected';
    refund.rejectionReason = rejectionReason.trim();
    refund.adminNote = (adminNote || '').trim();
    refund.processedAt = new Date();
    refund.processedBy = req.user._id;
    await refund.save();

    // Real-time socket notification to buyer
    try {
      const io = getIO();
      const userIdStr = refund.user.toString();

      io.to(`user_${userIdStr}`).emit('wallet_updated', {
        walletBalance: user.walletBalance,
        change: refund.amount,
        reason: 'refund_rejected_reversal',
        refundId: refund._id,
      });

      io.to(`user_${userIdStr}`).emit('buyer_refund_rejected', {
        refundId: refund._id,
        amount: refund.amount,
        rejectionReason: refund.rejectionReason,
        newBalance: user.walletBalance,
      });
    } catch (e) {
      console.warn('Socket error on refund rejection:', e);
    }

    // Fire push notification
    sendPushNotification(
      refund.user.toString(),
      'Refund Request Rejected (Funds Restored)',
      `Your refund request of ₹${refund.amount} was rejected: ${refund.rejectionReason}. The amount has been credited back to your wallet balance.`,
      'payment'
    ).catch(console.error);

    return sendSuccess(res, { refund, newBalance: user.walletBalance }, 'Buyer refund rejected and funds safely restored to buyer wallet.');
  } catch (error: any) {
    logger.error('Error rejecting buyer refund:', error);
    return sendError(res, error.message);
  }
};
