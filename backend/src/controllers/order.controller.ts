import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Order } from '../models/Order';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import crypto from 'crypto';
import { Product } from '../models/Product';
import { Message } from '../models/Message';
import mongoose from 'mongoose';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { getIO } from '../socket';
import { sendPushNotification } from '../services/notification.service';

// POST /api/orders
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, paymentMethod, paymentId, sessionId } = req.body;

    const product = await Product.findById(productId);
    if (!product) return sendError(res, 'Product not found.', 404);
    if (product.status !== 'active') return sendError(res, 'Product is not available.', 400);

    const order = await Order.create({
      user: req.user._id,
      product: product._id,
      seller: product.seller,
      amount: product.price,
      paymentMethod,
      paymentId: paymentId || '',
      sessionId,
      paymentStatus: 'pending',
      orderStatus: 'placed',
      timeline: [{ status: 'placed', date: new Date() }]
    });

    // Increment product sales
    await Product.findByIdAndUpdate(productId, { $inc: { totalSales: 1 } });

    // Notify seller
    await sendPushNotification(
      product.seller.toString(),
      'New Order!',
      `You received a new order for ${product.title}`,
      'order'
    );

    return sendSuccess(res, order, 'Order placed successfully.', 201);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/orders
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const userIdStr = req.user._id?.toString();
    const userObjId = mongoose.Types.ObjectId.isValid(userIdStr) ? new mongoose.Types.ObjectId(userIdStr) : null;

    const BundleOrder = mongoose.model('BundleOrder');

    const userConditions: any[] = [];
    if (userObjId) userConditions.push({ user: userObjId });
    if (userIdStr) userConditions.push({ user: userIdStr });

    const [allOrders, allBundleOrders] = await Promise.all([
      Order.find({ $or: userConditions })
        .populate('product', 'title logo price category')
        .populate('seller', 'name')
        .lean(),
      BundleOrder.find({ $or: userConditions })
        .populate('bundle', 'title thumbnail category')
        .populate('seller', 'name')
        .lean()
    ]);

    const mappedBundleOrders = allBundleOrders.map((b: any) => ({
      ...b,
      isBundle: true,
      product: b.bundle ? { _id: b.bundle._id, title: b.bundle.title, logo: b.bundle.thumbnail, price: b.bundlePrice, category: b.bundle.category } : null
    }));

    const combinedOrders = [...allOrders, ...mappedBundleOrders].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const total = combinedOrders.length;
    const paginatedOrders = combinedOrders.slice(skip, skip + limit);

    const { Review } = await import('../models/Review');
    const enrichedOrders = await Promise.all(
      paginatedOrders.map(async (order: any) => {
        let isReviewed = false;
        if (order.isBundle) {
          isReviewed = !!(await Review.exists({ user: req.user._id, bundle: order.product?._id }));
        } else {
          isReviewed = !!(await Review.exists({ user: req.user._id, product: order.product?._id }));
        }
        return { ...order, isReviewed };
      })
    );

    return sendPaginated(res, enrichedOrders, page, limit, total);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/orders/:id
export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    let order: any = await Order.findById(req.params.id)
      .populate('product')
      .populate('seller', 'name email avatar')
      .populate('user', 'name email avatar')
      .lean();

    let isBundle = false;
    if (!order) {
      const BundleOrder = mongoose.model('BundleOrder');
      order = await BundleOrder.findById(req.params.id)
        .populate({
          path: 'bundle',
          populate: { path: 'products.masterProduct' }
        })
        .populate('seller', 'name email avatar')
        .populate('user', 'name email avatar')
        .populate('credentials.masterProductId', 'name imageUrl')
        .lean();
      isBundle = true;
    }

    if (!order) return sendError(res, 'Order not found.', 404);

    // Only the buyer, seller, or admin can view the order
    const isOwner = order.user?._id?.toString() === req.user._id.toString();
    const isSeller = order.seller?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isSeller && !isAdmin) {
      return sendError(res, 'Not authorized.', 403);
    }

    const { Review } = await import('../models/Review');
    const query = isBundle 
      ? { user: req.user._id, bundle: order.bundle?._id || order.bundle }
      : { user: req.user._id, product: order.product?._id || order.product };
    const isReviewed = await Review.exists(query);

    return sendSuccess(res, { ...order, isReviewed: !!isReviewed });
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// PUT /api/orders/:id/status
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderStatus } = req.body;

    let order: any = await Order.findById(req.params.id);
    if (!order) {
      const BundleOrder = mongoose.model('BundleOrder');
      order = await BundleOrder.findById(req.params.id);
    }
    if (!order) return sendError(res, 'Order not found.', 404);

    // Authorization checks
    if (orderStatus === 'completed') {
      console.log('Completing order. Buyer:', order.user.toString(), 'Current user:', req.user._id.toString(), 'Role:', req.user.role);
      if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return sendError(res, 'Only the buyer can complete the order', 403);
      }
      
      // Handle Seller Earnings safely
      try {
        const existingTx = await Transaction.findOne({ order: order._id, type: 'credit' });
        if (!existingTx) {
          const transactionId = 'TXN_' + crypto.randomBytes(8).toString('hex').toUpperCase();
          const grossAmount = order.amount || 0;
          const platformCommission = 0; // Configurable commission
          const netEarning = grossAmount - platformCommission;

          const newTx = await Transaction.create({
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
          console.log(`Seller ${order.seller} credited ₹${netEarning} for order ${order._id}`);
        }
      } catch (err) {
        console.error('Failed to process seller earning during completion:', err);
      }
    } else {
      if (order.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return sendError(res, 'Only the seller can update the order status', 403);
      }
    }

    order.orderStatus = orderStatus;
    if (!order.timeline) order.timeline = [];
    order.timeline.push({ status: orderStatus, date: new Date() });
    
    await order.save();

    // Notify via socket
    try {
      getIO().to(`order_${order._id}`).emit('order_updated', order);
    } catch (e) {}

    // Notify buyer
    // Fire and forget push notification
    sendPushNotification(
      order.user.toString(),
      'Order Update',
      `Your order status has been updated to: ${orderStatus}`,
      'order'
    ).catch(console.error);

    return sendSuccess(res, order, 'Order status updated.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/orders/seller/me
export const getSellerOrders = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const BundleOrder = mongoose.model('BundleOrder');

    const [allOrders, allBundleOrders] = await Promise.all([
      Order.find({ seller: req.user._id })
        .populate('product', 'title logo price')
        .populate('user', 'name email')
        .lean(),
      BundleOrder.find({ seller: req.user._id })
        .populate('bundle', 'title thumbnail')
        .populate('user', 'name email')
        .lean()
    ]);

    const mappedBundleOrders = allBundleOrders.map((b: any) => ({
      ...b,
      isBundle: true,
      product: b.bundle ? { _id: b.bundle._id, title: b.bundle.title, logo: b.bundle.thumbnail, price: b.bundlePrice } : null
    }));

    const combinedOrders = [...allOrders, ...mappedBundleOrders].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const total = combinedOrders.length;
    const paginatedOrders = combinedOrders.slice(skip, skip + limit);

    return sendPaginated(res, paginatedOrders, page, limit, total);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/orders/:id/chat
export const getOrderChat = async (req: AuthRequest, res: Response) => {
  try {
    let order: any = await Order.findById(req.params.id);
    if (!order) {
      const BundleOrder = mongoose.model('BundleOrder');
      order = await BundleOrder.findById(req.params.id);
    }
    if (!order) return sendError(res, 'Order not found.', 404);

    const isOwner = order.user?.toString() === req.user._id.toString();
    const isSeller = order.seller?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isSeller && !isAdmin) return sendError(res, 'Not authorized.', 403);

    const messages = await Message.find({ orderId: order._id })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: 1 })
      .lean();

    return sendSuccess(res, messages);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// POST /api/orders/:id/chat
export const sendOrderMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { content, type = 'text', metadata } = req.body;
    let order: any = await Order.findById(req.params.id);
    let onModel: 'Order' | 'BundleOrder' = 'Order';
    if (!order) {
      const BundleOrder = mongoose.model('BundleOrder');
      order = await BundleOrder.findById(req.params.id);
      onModel = 'BundleOrder';
    }
    if (!order) return sendError(res, 'Order not found.', 404);

    const isOwner = order.user?.toString() === req.user._id.toString();
    const isSeller = order.seller?.toString() === req.user._id.toString();
    if (!isOwner && !isSeller) return sendError(res, 'Not authorized.', 403);

    const message = await Message.create({
      orderId: order._id,
      onModel,
      senderId: req.user._id,
      content,
      type,
      metadata,
      status: 'sent'
    });

    const populatedMessage = await message.populate('senderId', 'name avatar');

    try {
      const io = getIO();
      const orderIdStr = order._id?.toString();
      const buyerIdStr = order.user?.toString();
      const sellerIdStr = order.seller?.toString();

      io.to(`order_${orderIdStr}`).emit('new_message', populatedMessage);
      if (sellerIdStr) io.to(`user_${sellerIdStr}`).emit('new_message', populatedMessage);
      if (buyerIdStr) io.to(`user_${buyerIdStr}`).emit('new_message', populatedMessage);
    } catch (e) {}

    // Send push notification to the other party
    const recipientId = isOwner ? order.seller : order.user;
    await sendPushNotification(
      recipientId.toString(),
      'New Message',
      content.length > 50 ? content.substring(0, 50) + '...' : content,
      'system'
    );

    return sendSuccess(res, populatedMessage, 'Message sent', 201);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// PUT /api/orders/:id/deliver
export const deliverOrderCredentials = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, notes } = req.body;
    let order: any = await Order.findById(req.params.id);
    if (!order) {
      const BundleOrder = mongoose.model('BundleOrder');
      order = await BundleOrder.findById(req.params.id);
    }
    if (!order) return sendError(res, 'Order not found.', 404);

    if (order.seller.toString() !== req.user._id.toString()) {
      return sendError(res, 'Only seller can deliver credentials.', 403);
    }

    order.credentials = { email, password, notes };
    order.orderStatus = 'delivered';
    if (!order.timeline) order.timeline = [];
    order.timeline.push({ status: 'delivered', date: new Date() });
    
    await order.save();

    // Create a system message for the delivery
    const message = await Message.create({
      orderId: order._id,
      senderId: req.user._id,
      content: 'Credentials have been delivered.',
      type: 'credentials',
      status: 'sent'
    });
    const populatedMessage = await message.populate('senderId', 'name avatar');

    try {
      const io = getIO();
      const orderIdStr = order._id?.toString();
      const buyerIdStr = order.user?.toString();
      const sellerIdStr = order.seller?.toString();

      io.to(`order_${orderIdStr}`).emit('order_updated', order);
      io.to(`order_${orderIdStr}`).emit('new_message', populatedMessage);
      if (sellerIdStr) io.to(`user_${sellerIdStr}`).emit('new_message', populatedMessage);
      if (buyerIdStr) io.to(`user_${buyerIdStr}`).emit('new_message', populatedMessage);
    } catch (e) {}

    // Fire and forget push notification
    sendPushNotification(
      order.user.toString(),
      'Order Delivered!',
      'Your credentials have been securely delivered. Check your order chat.',
      'order'
    ).catch(console.error);

    return sendSuccess(res, order, 'Credentials delivered successfully.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// PUT /api/orders/:id/seen
export const markMessagesSeen = async (req: AuthRequest, res: Response) => {
  try {
    let order: any = await Order.findById(req.params.id);
    if (!order) {
      const BundleOrder = mongoose.model('BundleOrder');
      order = await BundleOrder.findById(req.params.id);
    }
    if (!order) return sendError(res, 'Order not found.', 404);

    await Message.updateMany(
      { orderId: order._id, senderId: { $ne: req.user._id }, status: { $ne: 'seen' } },
      { $set: { status: 'seen' } }
    );
    
    try {
      getIO().to(`order_${order._id}`).emit('messages_seen', {
        userId: req.user._id,
        orderId: order._id
      });
    } catch (e) {}

    return sendSuccess(res, null, 'Marked as seen');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/orders/chats
export const getMyChats = async (req: AuthRequest, res: Response) => {
  try {
    const userIdStr = req.user._id?.toString();
    const userObjId = mongoose.Types.ObjectId.isValid(userIdStr) ? new mongoose.Types.ObjectId(userIdStr) : null;

    const BundleOrder = mongoose.model('BundleOrder');

    const userConditions: any[] = [];
    if (userObjId) userConditions.push({ user: userObjId }, { seller: userObjId });
    if (userIdStr) userConditions.push({ user: userIdStr }, { seller: userIdStr });
    
    // Fetch all active orders where user is either buyer or seller (excluding failed/rejected)
    const [orders, bundleOrders] = await Promise.all([
      Order.find({
        $or: userConditions,
        paymentStatus: { $nin: ['failed', 'payment_rejected'] }
      })
        .populate('user', 'name avatar')
        .populate('seller', 'name avatar')
        .populate('product', 'title logo')
        .lean(),
      BundleOrder.find({
        $or: userConditions,
        paymentStatus: { $nin: ['failed', 'payment_rejected'] }
      })
        .populate('user', 'name avatar')
        .populate('seller', 'name avatar')
        .populate('bundle', 'title thumbnail')
        .lean()
    ]);

    const mappedBundleOrders = bundleOrders.map((b: any) => ({
      ...b,
      isBundle: true,
      product: b.bundle ? { _id: b.bundle._id, title: b.bundle.title, logo: b.bundle.thumbnail } : null
    }));

    const allOrders = [...orders, ...mappedBundleOrders];

    // Fetch last message and unread count for each order concurrently
    const chats = await Promise.all(
      allOrders.map(async (order) => {
        const orderIdStr = order._id?.toString();
        const orderObjId = mongoose.Types.ObjectId.isValid(orderIdStr) ? new mongoose.Types.ObjectId(orderIdStr) : null;

        const orderConditions: any[] = [];
        if (orderObjId) orderConditions.push({ orderId: orderObjId });
        if (orderIdStr) orderConditions.push({ orderId: orderIdStr });

        const lastMessage = await Message.findOne({ $or: orderConditions })
          .sort({ createdAt: -1 })
          .populate('senderId', 'name avatar')
          .lean();

        const unreadConditions: any[] = [];
        if (userObjId) unreadConditions.push({ senderId: { $ne: userObjId } });
        if (userIdStr) unreadConditions.push({ senderId: { $ne: userIdStr } });

        const unreadCount = await Message.countDocuments({
          $or: orderConditions,
          $and: unreadConditions,
          status: { $ne: 'seen' }
        });

        // Use last message date, or fallback to order update/creation date
        const lastActivity = lastMessage 
          ? lastMessage.createdAt 
          : (order.updatedAt || order.createdAt);

        return {
          order,
          lastMessage,
          unreadCount,
          lastActivity
        };
      })
    );

    // Sort by last activity descending (newest first)
    chats.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

    return sendSuccess(res, chats);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};
