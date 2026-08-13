import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Transaction } from '../models/Transaction';
import crypto from 'crypto';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { firebaseAuth } from '../config/firebase';

// GET /api/admin/stats
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const latestOrder = await Order.findOne({ paymentStatus: { $in: ['paid', 'payment_verified'] } }).sort({ createdAt: -1 });
    const anchorDate = latestOrder ? latestOrder.createdAt : new Date();
    
    const sixMonthsAgo = new Date(anchorDate);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [totalUsers, totalProducts, totalOrders, totalRevenue, monthlyRevenueRaw] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: { $in: ['paid', 'payment_verified'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: { $in: ['paid', 'payment_verified'] }, createdAt: { $gte: sixMonthsAgo } } },
        { 
          $group: { 
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            total: { $sum: '$amount' }
          }
        }
      ])
    ]);

    // Format monthly revenue
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = [];
    const now = anchorDate;
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // MongoDB months are 1-12
      
      const match = monthlyRevenueRaw.find(m => m._id.year === year && m._id.month === month);
      monthlyRevenue.push({
        name: monthNames[d.getMonth()],
        value: match ? match.total : 0
      });
    }

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('product', 'title')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return sendSuccess(res, {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue,
      recentOrders,
    });
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/admin/users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    return sendPaginated(res, users, page, limit, total);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/admin/products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('seller', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return sendPaginated(res, products, page, limit, total);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// PUT /api/admin/users/:id/role
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    if (!['user', 'seller', 'admin'].includes(role)) {
      return sendError(res, 'Invalid role.', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) return sendError(res, 'User not found.', 404);
    return sendSuccess(res, user, 'User role updated.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// PUT /api/admin/products/:id/status
export const updateProductStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'pending'].includes(status)) {
      return sendError(res, 'Invalid status.', 400);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!product) return sendError(res, 'Product not found.', 404);
    return sendSuccess(res, product, 'Product status updated.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/admin/orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find()
        .populate('user', 'name email')
        .populate('product', 'title price')
        .populate('seller', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(),
    ]);

    return sendPaginated(res, orders, page, limit, total);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/admin/applications
export const getApplications = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;

    // Must import SellerApplication at top of file
    const { SellerApplication } = await import('../models/SellerApplication');

    const [applications, total] = await Promise.all([
      SellerApplication.find(filter)
        .populate('user', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SellerApplication.countDocuments(filter),
    ]);

    return sendPaginated(res, applications, page, limit, total);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// PUT /api/admin/applications/:id/status
export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return sendError(res, 'Invalid status.', 400);
    }

    const { SellerApplication } = await import('../models/SellerApplication');

    const application = await SellerApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application) return sendError(res, 'Application not found.', 404);

    if (status === 'approved') {
      await User.findByIdAndUpdate(application.user, { 
        role: 'seller',
        sellerStatus: 'approved',
        approvedAt: new Date()
      });
    } else if (status === 'rejected') {
      await User.findByIdAndUpdate(application.user, {
        sellerStatus: 'rejected'
      });
    }

    return sendSuccess(res, application, `Application ${status}.`);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found.', 404);

    if (user.role === 'admin') {
      return sendError(res, 'Cannot delete an admin user.', 403);
    }

    try {
      await firebaseAuth.deleteUser(user.firebaseUid);
    } catch (err) {
      console.log('Firebase user deletion skipped or failed');
    }

    await User.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, 'User deleted successfully.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// DELETE /api/admin/products/:id
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 'Product not found.', 404);

    await Product.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, 'Product deleted successfully.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// POST /api/admin/reconcile-earnings
export const reconcileEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const completedOrders = await Order.find({ orderStatus: 'completed' });
    let creditedCount = 0;

    for (const order of completedOrders) {
      const existingTx = await Transaction.findOne({ order: order._id, type: 'credit' });
      if (!existingTx) {
        const transactionId = 'TXN_REC_' + crypto.randomBytes(6).toString('hex').toUpperCase();
        const grossAmount = order.amount || 0;
        const netEarning = grossAmount;

        await Transaction.create({
          transactionId,
          order: order._id,
          seller: order.seller,
          grossAmount,
          platformCommission: 0,
          netEarning,
          type: 'credit',
          status: 'completed'
        });

        await User.findByIdAndUpdate(order.seller, {
          $inc: { walletBalance: netEarning }
        });
        creditedCount++;
      }
    }

    return sendSuccess(res, { creditedCount }, `Reconciliation complete. ${creditedCount} missing earnings credited.`);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};
