import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { WalletTopup } from '../models/WalletTopup';
import { BuyerWithdrawal } from '../models/BuyerWithdrawal';
import { Order } from '../models/Order';
import { BundleOrder } from '../models/BundleOrder';
import { sendSuccess, sendError } from '../utils/response';
import { getIO } from '../socket';
import { logger } from '../utils/logger';

// GET /api/wallet/me
export const getBuyerWallet = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;

    const [user, topups, withdrawals, walletOrders, walletBundleOrders] = await Promise.all([
      User.findById(userId).select('walletBalance name email avatar').lean(),
      WalletTopup.find({ user: userId }).sort({ createdAt: -1 }).limit(50).lean(),
      BuyerWithdrawal.find({ user: userId }).sort({ createdAt: -1 }).limit(50).lean(),
      Order.find({ user: userId, paymentMethod: 'wallet' })
        .populate('product', 'title logo price duration')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      BundleOrder.find({ user: userId, paymentMethod: 'wallet' })
        .populate('bundle', 'title thumbnail bundlePrice')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
    ]);

    if (!user) return sendError(res, 'User not found', 404);

    let totalTopupApproved = 0;
    let pendingTopupTotal = 0;
    for (const t of topups) {
      if (t.status === 'completed') totalTopupApproved += t.amount;
      else if (t.status === 'pending_verification') pendingTopupTotal += t.amount;
    }

    let totalWithdrawnCompleted = 0;
    let pendingWithdrawalTotal = 0;
    for (const w of withdrawals) {
      if (w.status === 'completed') totalWithdrawnCompleted += w.amount;
      else if (w.status === 'pending') pendingWithdrawalTotal += w.amount;
    }

    let totalSpent = 0;
    for (const o of walletOrders) {
      totalSpent += o.amount || 0;
    }
    for (const bo of walletBundleOrders) {
      totalSpent += bo.amount || 0;
    }

    // Build unified chronological activity list
    const activity: any[] = [];

    topups.forEach((t) => {
      activity.push({
        id: t._id,
        type: 'topup',
        title: 'Wallet Top-Up',
        description: t.upiReference ? `UPI Ref: ${t.upiReference}` : 'Manual UPI Top-Up',
        amount: t.amount,
        isCredit: true,
        status: t.status,
        rejectionReason: t.rejectionReason,
        createdAt: t.createdAt,
      });
    });

    withdrawals.forEach((w) => {
      activity.push({
        id: w._id,
        type: 'withdrawal',
        title: 'UPI Refund / Withdrawal',
        description: `To UPI: ${w.upiId}${w.transactionReference ? ` (Ref: ${w.transactionReference})` : ''}`,
        amount: w.amount,
        isCredit: false,
        status: w.status,
        rejectionReason: w.rejectionReason,
        adminNote: w.adminNote,
        createdAt: w.createdAt,
      });
    });

    walletOrders.forEach((o: any) => {
      activity.push({
        id: o._id,
        type: 'purchase',
        title: `Purchased: ${o.product?.title || 'Product'}`,
        description: `Order #${o._id.toString().substring(o._id.toString().length - 8).toUpperCase()}`,
        amount: o.amount,
        isCredit: false,
        status: o.orderStatus,
        createdAt: o.createdAt,
        orderId: o._id,
      });
    });

    walletBundleOrders.forEach((bo: any) => {
      activity.push({
        id: bo._id,
        type: 'purchase',
        title: `Purchased Bundle: ${bo.bundle?.title || 'Bundle'}`,
        description: `Bundle Order #${bo._id.toString().substring(bo._id.toString().length - 8).toUpperCase()}`,
        amount: bo.amount,
        isCredit: false,
        status: bo.orderStatus,
        createdAt: bo.createdAt,
        orderId: bo._id,
      });
    });

    activity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return sendSuccess(res, {
      walletBalance: user.walletBalance || 0,
      stats: {
        availableBalance: user.walletBalance || 0,
        totalTopup: totalTopupApproved,
        pendingTopup: pendingTopupTotal,
        totalSpent,
        totalWithdrawn: totalWithdrawnCompleted,
        pendingWithdrawal: pendingWithdrawalTotal,
      },
      topups,
      withdrawals,
      activity: activity.slice(0, 50),
    });
  } catch (error: any) {
    logger.error('Error fetching buyer wallet:', error);
    return sendError(res, error.message);
  }
};

// POST /api/wallet/topup
export const requestTopup = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, screenshot, upiReference } = req.body;
    const parsedAmount = Number(amount);

    if (isNaN(parsedAmount)) {
      return sendError(res, 'Please provide a valid numeric amount.', 400);
    }

    if (parsedAmount < 30) {
      return sendError(res, 'Minimum top-up amount is ₹30.', 400);
    }

    if (parsedAmount > 1000) {
      return sendError(res, 'Maximum top-up amount is ₹1,000.', 400);
    }

    if (!screenshot) {
      return sendError(res, 'Payment screenshot proof is required.', 400);
    }

    const topup = await WalletTopup.create({
      user: req.user._id,
      amount: parsedAmount,
      paymentScreenshot: screenshot,
      upiReference: upiReference || '',
      status: 'pending_verification',
    });

    // Notify admins in real-time
    try {
      const io = getIO();
      io.emit('new_wallet_topup', {
        topupId: topup._id,
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
        amount: parsedAmount,
        createdAt: topup.createdAt,
      });
    } catch (e) {
      console.warn('Socket emit error for topup:', e);
    }

    return sendSuccess(res, topup, 'Top-up proof submitted successfully. Your wallet balance will be updated once verified.', 201);
  } catch (error: any) {
    logger.error('Error creating wallet topup request:', error);
    return sendError(res, error.message);
  }
};

// POST /api/wallet/withdraw
export const requestWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, upiId, beneficiaryName } = req.body;
    const parsedAmount = Number(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return sendError(res, 'Please enter a valid withdrawal amount.', 400);
    }

    if (!upiId || !upiId.trim() || !upiId.includes('@')) {
      return sendError(res, 'Please enter a valid UPI ID (e.g. name@upi, number@paytm).', 400);
    }

    // Atomically check and deduct wallet balance
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        walletBalance: { $gte: parsedAmount },
      },
      {
        $inc: { walletBalance: -parsedAmount },
      },
      { new: true }
    );

    if (!updatedUser) {
      return sendError(res, 'Insufficient wallet balance for this withdrawal amount.', 400);
    }

    const withdrawal = await BuyerWithdrawal.create({
      user: req.user._id,
      amount: parsedAmount,
      upiId: upiId.trim(),
      beneficiaryName: (beneficiaryName || req.user.name || '').trim(),
      status: 'pending',
    });

    // Notify user & admins via socket
    try {
      const io = getIO();
      const userIdStr = req.user._id.toString();

      // Update user's live balance
      io.to(`user_${userIdStr}`).emit('wallet_updated', {
        walletBalance: updatedUser.walletBalance,
        change: -parsedAmount,
        reason: 'withdrawal_requested',
      });

      // Alert admins
      io.emit('new_buyer_withdrawal', {
        withdrawalId: withdrawal._id,
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
        amount: parsedAmount,
        upiId: withdrawal.upiId,
        createdAt: withdrawal.createdAt,
      });
    } catch (e) {
      console.warn('Socket emit error for buyer withdrawal:', e);
    }

    return sendSuccess(
      res,
      {
        withdrawal,
        walletBalance: updatedUser.walletBalance,
      },
      'Withdrawal / Refund request placed successfully. Your refund will be processed within 24 hours.',
      201
    );
  } catch (error: any) {
    logger.error('Error creating buyer withdrawal request:', error);
    return sendError(res, error.message);
  }
};
