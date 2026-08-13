import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SellerApplication } from '../models/SellerApplication';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { Notification } from '../models/Notification';
import { sendSuccess, sendError } from '../utils/response';

// POST /api/seller/application
export const applySeller = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return sendError(res, 'User not found.', 404);

    if (user.role === 'seller' || user.role === 'admin') {
      return sendError(res, 'User is already a seller or admin.', 400);
    }

    const existingApplication = await SellerApplication.findOne({ user: user._id });
    if (existingApplication && existingApplication.status !== 'rejected') {
      return sendError(res, 'You already have a pending or approved application.', 400);
    }

    const { fullName, email, phone, description, additionalInfo } = req.body;

    const application = await SellerApplication.create({
      user: user._id,
      fullName,
      email,
      phone,
      description,
      additionalInfo,
      status: 'pending',
    });

    await User.findByIdAndUpdate(user._id, {
      sellerStatus: 'pending',
      applicationSubmittedAt: new Date(),
    });

    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0) {
      const notifications = admins.map((admin) => ({
        user: admin._id,
        title: 'New Seller Application',
        message: `${fullName} has applied to become a seller.`,
        type: 'application',
        actionUrl: '/admin/applications',
      }));
      await Notification.insertMany(notifications);
    }

    return sendSuccess(res, application, 'Application submitted successfully.', 201);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/seller/application/me
export const getMyApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return sendError(res, 'User not found.', 404);

    const application = await SellerApplication.findOne({ user: user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, application);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/seller/wallet
export const getWallet = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance');
    if (!user) return sendError(res, 'User not found.', 404);

    const transactions = await Transaction.find({ seller: user._id })
      .populate({
        path: 'order',
        populate: { path: 'product', select: 'title' }
      })
      .sort({ createdAt: -1 });

    return sendSuccess(res, { balance: user.walletBalance || 0, transactions }, 'Wallet fetched.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};
