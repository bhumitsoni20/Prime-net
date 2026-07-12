import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Message } from '../models/Message';
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

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .populate('product', 'title logo price category')
        .populate('seller', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ user: req.user._id }),
    ]);

    return sendPaginated(res, orders, page, limit, total);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/orders/:id
export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('product')
      .populate('seller', 'name email')
      .populate('user', 'name email')
      .lean();

    if (!order) return sendError(res, 'Order not found.', 404);

    // Only the buyer, seller, or admin can view the order
    const isOwner = order.user?._id?.toString() === req.user._id.toString();
    const isSeller = order.seller?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isSeller && !isAdmin) {
      return sendError(res, 'Not authorized.', 403);
    }

    return sendSuccess(res, order);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// PUT /api/orders/:id/status
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return sendError(res, 'Order not found.', 404);

    order.orderStatus = orderStatus;
    if (!order.timeline) order.timeline = [];
    order.timeline.push({ status: orderStatus, date: new Date() });
    
    await order.save();

    // Notify via socket
    try {
      getIO().to(`order_${order._id}`).emit('order_updated', order);
    } catch (e) {}

    // Notify buyer
    await sendPushNotification(
      order.user.toString(),
      'Order Update',
      `Your order status has been updated to: ${orderStatus}`,
      'order'
    );

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

    const [orders, total] = await Promise.all([
      Order.find({ seller: req.user._id })
        .populate('product', 'title logo price')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ seller: req.user._id }),
    ]);

    return sendPaginated(res, orders, page, limit, total);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/orders/:id/chat
export const getOrderChat = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
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
    const order = await Order.findById(req.params.id);
    if (!order) return sendError(res, 'Order not found.', 404);

    const isOwner = order.user?.toString() === req.user._id.toString();
    const isSeller = order.seller?.toString() === req.user._id.toString();
    if (!isOwner && !isSeller) return sendError(res, 'Not authorized.', 403);

    const message = await Message.create({
      orderId: order._id,
      senderId: req.user._id,
      content,
      type,
      metadata,
      status: 'sent'
    });

    const populatedMessage = await message.populate('senderId', 'name avatar');

    try {
      getIO().to(`order_${order._id}`).emit('new_message', populatedMessage);
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
    const order = await Order.findById(req.params.id);
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
      io.to(`order_${order._id}`).emit('order_updated', order);
      io.to(`order_${order._id}`).emit('new_message', populatedMessage);
    } catch (e) {}

    await sendPushNotification(
      order.user.toString(),
      'Order Delivered!',
      'Your credentials have been securely delivered. Check your order chat.',
      'order'
    );

    return sendSuccess(res, order, 'Credentials delivered successfully.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// PUT /api/orders/:id/seen
export const markMessagesSeen = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
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
    const userId = req.user._id;

    // Fetch all paid orders where user is either buyer or seller
    const orders = await Order.find({
      $or: [{ user: userId }, { seller: userId }],
      paymentStatus: 'paid'
    })
      .populate('user', 'name avatar')
      .populate('seller', 'name avatar')
      .populate('product', 'title logo')
      .lean();

    // Fetch last message and unread count for each order concurrently
    const chats = await Promise.all(
      orders.map(async (order) => {
        const lastMessage = await Message.findOne({ orderId: order._id })
          .sort({ createdAt: -1 })
          .populate('senderId', 'name avatar')
          .lean();

        const unreadCount = await Message.countDocuments({
          orderId: order._id,
          senderId: { $ne: userId },
          status: { $ne: 'seen' }
        });

        // Use last message date, or fallback to order creation date
        const lastActivity = lastMessage ? lastMessage.createdAt : order.createdAt;

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
