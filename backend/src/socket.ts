import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from './utils/logger';
import { firebaseAuth } from './config/firebase';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Adjust to your frontend URL in production
      methods: ['GET', 'POST'],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      socket.data.user = decodedToken;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.data.user.uid})`);

    // Join order chat room
    socket.on('join_order', (orderId: string) => {
      socket.join(`order_${orderId}`);
      logger.info(`User ${socket.data.user.uid} joined room: order_${orderId}`);
    });

    // Handle typing
    socket.on('typing', ({ orderId, isTyping }) => {
      socket.to(`order_${orderId}`).emit('user_typing', {
        userId: socket.data.user.uid,
        isTyping,
      });
    });

    // Mark messages as seen
    socket.on('mark_seen', ({ orderId }) => {
      socket.to(`order_${orderId}`).emit('messages_seen', {
        userId: socket.data.user.uid,
        orderId
      });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
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
