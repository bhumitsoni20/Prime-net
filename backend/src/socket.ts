import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from './utils/logger';
import { firebaseAuth } from './config/firebase';
import { User } from './models/User';
import { Order } from './models/Order';
import { BundleOrder } from './models/BundleOrder';
import { Message } from './models/Message';

let io: Server;

// Online presence mapping: userId -> { socketIds: Set<string>, lastSeen: Date }
const onlineUsers = new Map<string, { socketIds: Set<string>; lastSeen: Date }>();

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Adjust to frontend URL in production
      methods: ['GET', 'POST'],
    },
  });

  // Authentication Middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }
      
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      const dbUser = await User.findOne({ firebaseUid: decodedToken.uid });
      
      if (dbUser) {
        socket.data.user = {
          _id: dbUser._id.toString(),
          firebaseUid: dbUser.firebaseUid,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
        };
      } else {
        socket.data.user = {
          _id: decodedToken.uid,
          firebaseUid: decodedToken.uid,
          role: 'user',
        };
      }
      next();
    } catch (err) {
      logger.error('Socket authentication error:', err);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user?._id;
    logger.info(`Socket connected: ${socket.id} (User: ${userId})`);

    // Track online presence
    if (userId) {
      let userPresence = onlineUsers.get(userId);
      if (!userPresence) {
        userPresence = { socketIds: new Set(), lastSeen: new Date() };
        onlineUsers.set(userId, userPresence);
      }
      userPresence.socketIds.add(socket.id);

      // Broadcast user online event
      io.emit('user_presence', {
        userId,
        status: 'online',
        lastSeen: new Date(),
      });
      
      // Join personal room for user-specific events
      socket.join(`user_${userId}`);
    }

    // Join Order Room with authorization check
    socket.on('join_order', async (orderId: string) => {
      try {
        if (!orderId) return;

        let order: any = await Order.findById(orderId);
        if (!order) {
          order = await BundleOrder.findById(orderId);
        }

        if (!order) {
          socket.emit('socket_error', { message: 'Order not found' });
          return;
        }

        const buyerId = order.user?.toString();
        const sellerId = order.seller?.toString();
        const isAdmin = socket.data.user?.role === 'admin';

        if (userId !== buyerId && userId !== sellerId && !isAdmin) {
          logger.warn(`Unauthorized room join attempt by ${userId} for order ${orderId}`);
          socket.emit('socket_error', { message: 'Unauthorized room access' });
          return;
        }

        const roomName = `order_${orderId}`;
        socket.join(roomName);
        logger.info(`User ${userId} joined room: ${roomName}`);
        socket.emit('joined_room', { orderId, room: roomName });
      } catch (error: any) {
        logger.error(`Error joining room order_${orderId}:`, error);
      }
    });

    // Leave Order Room
    socket.on('leave_order', (orderId: string) => {
      const roomName = `order_${orderId}`;
      socket.leave(roomName);
      logger.info(`User ${userId} left room: ${roomName}`);
    });

    // Typing Indicators
    socket.on('typing', ({ orderId, isTyping }: { orderId: string; isTyping: boolean }) => {
      socket.to(`order_${orderId}`).emit('user_typing', {
        userId,
        isTyping,
      });
    });

    // Mark Messages as Seen with real-time timestamps
    socket.on('mark_seen', async ({ orderId }: { orderId: string }) => {
      try {
        const now = new Date();
        // Update messages in DB
        await Message.updateMany(
          { orderId, senderId: { $ne: userId }, status: { $ne: 'seen' } },
          { $set: { status: 'seen', seenAt: now } }
        );

        // Notify room participants
        io.to(`order_${orderId}`).emit('messages_seen', {
          userId,
          orderId,
          seenAt: now,
        });
      } catch (err) {
        logger.error('Error marking messages seen via socket:', err);
      }
    });

    // Presence Query
    socket.on('get_presence', (targetUserId: string, callback?: Function) => {
      const presence = onlineUsers.get(targetUserId);
      const isOnline = !!presence && presence.socketIds.size > 0;
      const statusData = {
        userId: targetUserId,
        status: isOnline ? 'online' : 'offline',
        lastSeen: presence?.lastSeen || null,
      };
      if (typeof callback === 'function') {
        callback(statusData);
      } else {
        socket.emit('user_presence_status', statusData);
      }
    });

    // Disconnect Handler
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id} (User: ${userId})`);
      if (userId) {
        const userPresence = onlineUsers.get(userId);
        if (userPresence) {
          userPresence.socketIds.delete(socket.id);
          if (userPresence.socketIds.size === 0) {
            userPresence.lastSeen = new Date();
            io.emit('user_presence', {
              userId,
              status: 'offline',
              lastSeen: userPresence.lastSeen,
            });
          }
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export const getOnlineUserPresence = (userId: string) => {
  const presence = onlineUsers.get(userId);
  return {
    isOnline: !!presence && presence.socketIds.size > 0,
    lastSeen: presence?.lastSeen || null,
  };
};
