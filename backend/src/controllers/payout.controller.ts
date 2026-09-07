import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Withdrawal } from '../models/Withdrawal';
import { Transaction } from '../models/Transaction';
import { Notification } from '../models/Notification';
import { sendSuccess, sendError } from '../utils/response';
import { sendPushNotification } from '../services/notification.service';
import crypto from 'crypto';
import mongoose from 'mongoose';

// GET /api/payouts/seller/wallet
export const getSellerWallet = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;

    // Parallel fetch: user, aggregate stats, recent withdrawals & transactions
    const [user, withdrawalStats, earnedStats, withdrawals, transactions] = await Promise.all([
      User.findById(userId).select('walletBalance upiId upiQrCode').lean(),
      Withdrawal.aggregate([
        { $match: { seller: userId } },
        {
          $group: {
            _id: '$status',
            total: { $sum: '$amount' },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: { seller: userId, type: 'credit', status: 'completed' } },
        {
          $group: {
            _id: null,
            totalEarned: { $sum: '$netEarning' },
          },
        },
      ]),
      Withdrawal.find({ seller: userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Transaction.find({ seller: userId })
        .populate({ path: 'order', select: 'amount originalAmount product bundle' })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
    ]);

    if (!user) return sendError(res, 'User not found.', 404);

    let totalWithdrawn = 0;
    let pendingWithdrawn = 0;
    for (const stat of withdrawalStats) {
      if (stat._id === 'completed') totalWithdrawn = stat.total;
      else if (stat._id === 'pending') pendingWithdrawn = stat.total;
    }

    const totalEarned = earnedStats[0]?.totalEarned || 0;

    return sendSuccess(res, {
      walletBalance: user.walletBalance || 0,
      upiId: user.upiId || '',
      upiQrCode: user.upiQrCode || '',
      stats: {
        availableBalance: user.walletBalance || 0,
        totalEarned: Number(totalEarned.toFixed(2)),
        totalWithdrawn: Number(totalWithdrawn.toFixed(2)),
        pendingWithdrawn: Number(pendingWithdrawn.toFixed(2)),
      },
      withdrawals,
      transactions,
    });
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// POST /api/payouts/seller/settings
export const updatePayoutSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { upiId, upiQrCode } = req.body;

    if (!upiId || typeof upiId !== 'string' || !upiId.trim()) {
      return sendError(res, 'A valid UPI ID is required.', 400);
    }

    const updateData: any = { upiId: upiId.trim() };
    if (upiQrCode !== undefined) {
      updateData.upiQrCode = upiQrCode;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('upiId upiQrCode').lean();

    return sendSuccess(
      res,
      {
        upiId: user?.upiId,
        upiQrCode: user?.upiQrCode,
      },
      'Payout settings updated successfully.'
    );
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// POST /api/payouts/seller/withdraw
export const requestWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, upiId, qrCode } = req.body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return sendError(res, 'Please enter a valid withdrawal amount.', 400);
    }

    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 'User not found.', 404);

    if (user.role !== 'seller' && user.role !== 'admin') {
      return sendError(res, 'Only verified sellers can request withdrawals.', 403);
    }

    if ((user.walletBalance || 0) < numAmount) {
      return sendError(
        res,
        `Insufficient wallet balance. Available: ₹${(user.walletBalance || 0).toLocaleString()}`,
        400
      );
    }

    const targetUpiId = (upiId || user.upiId || '').trim();
    if (!targetUpiId) {
      return sendError(res, 'UPI ID is required to process withdrawal.', 400);
    }

    const targetQrCode = qrCode || user.upiQrCode || '';

    // Atomically deduct balance
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id, walletBalance: { $gte: numAmount } },
      {
        $inc: { walletBalance: -numAmount },
        ...(targetUpiId && !user.upiId ? { upiId: targetUpiId } : {}),
        ...(targetQrCode && !user.upiQrCode ? { upiQrCode: targetQrCode } : {}),
      },
      { new: true }
    );

    if (!updatedUser) {
      return sendError(res, 'Failed to process withdrawal. Please verify balance and try again.', 400);
    }

    // Create Withdrawal Record
    const withdrawal = await Withdrawal.create({
      seller: user._id,
      amount: numAmount,
      upiId: targetUpiId,
      qrCode: targetQrCode,
      status: 'pending',
    });

    // Create a matching debit Transaction
    const transactionId = 'WD_' + crypto.randomBytes(6).toString('hex').toUpperCase();
    await Transaction.create({
      transactionId,
      order: new mongoose.Types.ObjectId(), // Virtual identifier for withdrawal txn
      seller: user._id,
      grossAmount: numAmount,
      platformCommission: 0,
      netEarning: numAmount,
      type: 'debit',
      status: 'pending',
    });

    // Create Notification for Seller
    await Notification.create({
      user: user._id,
      title: 'Withdrawal Requested',
      message: `Your withdrawal request for ₹${numAmount.toLocaleString()} has been received and will be processed within 24 hours.`,
      type: 'payment',
      actionUrl: '/seller/wallet',
    });

    sendPushNotification(
      user._id.toString(),
      'Withdrawal Requested',
      `Your payout of ₹${numAmount.toLocaleString()} will be transferred to ${targetUpiId} within 24 hours.`,
      'payment',
      '/seller/wallet'
    ).catch(() => {});

    return sendSuccess(
      res,
      {
        withdrawal,
        walletBalance: updatedUser.walletBalance,
      },
      'Withdrawal request submitted successfully. It will be fulfilled within 24 hours.'
    );
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/payouts/admin/requests
export const getAdminPayouts = async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;

    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const [withdrawals, total, pendingCount, pendingTotalDoc, completedTotalDoc] = await Promise.all([
      Withdrawal.find(query)
        .populate('seller', 'name email phone avatar walletBalance')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Withdrawal.countDocuments(query),
      Withdrawal.countDocuments({ status: 'pending' }),
      Withdrawal.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Withdrawal.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const pendingTotal = pendingTotalDoc[0]?.total || 0;
    const completedTotal = completedTotalDoc[0]?.total || 0;

    return res.status(200).json({
      success: true,
      message: 'Payouts retrieved successfully',
      data: withdrawals,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      stats: {
        pendingCount,
        pendingTotal,
        completedTotal,
      },
    });
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// POST /api/payouts/admin/requests/:id/approve
export const approvePayout = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { transactionReference, adminNote } = req.body;

    const withdrawal = await Withdrawal.findById(id).populate('seller', 'name email phone');
    if (!withdrawal) return sendError(res, 'Withdrawal request not found.', 404);

    if (withdrawal.status !== 'pending') {
      return sendError(res, `This withdrawal is already ${withdrawal.status}.`, 400);
    }

    withdrawal.status = 'completed';
    withdrawal.transactionReference = transactionReference || '';
    withdrawal.adminNote = adminNote || '';
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    // Mark matching debit transaction as completed
    await Transaction.findOneAndUpdate(
      { seller: withdrawal.seller._id, type: 'debit', status: 'pending', grossAmount: withdrawal.amount },
      { status: 'completed' }
    );

    // Notify seller
    await Notification.create({
      user: withdrawal.seller._id,
      title: 'Payout Transferred!',
      message: `Your withdrawal of ₹${withdrawal.amount.toLocaleString()} has been paid to ${withdrawal.upiId}.${
        transactionReference ? ` Ref: ${transactionReference}` : ''
      }`,
      type: 'payment',
      actionUrl: '/seller/wallet',
    });

    sendPushNotification(
      withdrawal.seller._id.toString(),
      'Payout Transferred!',
      `₹${withdrawal.amount.toLocaleString()} has been transferred to ${withdrawal.upiId}.`,
      'payment',
      '/seller/wallet'
    ).catch(() => {});

    return sendSuccess(res, withdrawal, 'Payout marked as completed successfully.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// POST /api/payouts/admin/requests/:id/reject
export const rejectPayout = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return sendError(res, 'A rejection reason is required.', 400);
    }

    const withdrawal = await Withdrawal.findById(id).populate('seller', 'name email phone');
    if (!withdrawal) return sendError(res, 'Withdrawal request not found.', 404);

    if (withdrawal.status !== 'pending') {
      return sendError(res, `This withdrawal is already ${withdrawal.status}.`, 400);
    }

    withdrawal.status = 'rejected';
    withdrawal.adminNote = rejectionReason.trim();
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    // Refund funds back to seller wallet
    await User.findByIdAndUpdate(withdrawal.seller._id, {
      $inc: { walletBalance: withdrawal.amount },
    });

    // Mark matching debit transaction as failed
    await Transaction.findOneAndUpdate(
      { seller: withdrawal.seller._id, type: 'debit', status: 'pending', grossAmount: withdrawal.amount },
      { status: 'failed' }
    );

    // Notify seller
    await Notification.create({
      user: withdrawal.seller._id,
      title: 'Withdrawal Rejected',
      message: `Your withdrawal of ₹${withdrawal.amount.toLocaleString()} was rejected. Reason: ${rejectionReason.trim()}. The amount has been refunded to your wallet.`,
      type: 'payment',
      actionUrl: '/seller/wallet',
    });

    sendPushNotification(
      withdrawal.seller._id.toString(),
      'Withdrawal Rejected',
      `Your withdrawal for ₹${withdrawal.amount.toLocaleString()} was rejected. Funds are refunded to your balance.`,
      'payment',
      '/seller/wallet'
    ).catch(() => {});

    return sendSuccess(res, withdrawal, 'Payout request rejected and balance refunded.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};
