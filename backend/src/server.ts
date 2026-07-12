import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { logger } from './utils/logger';
import { createServer } from 'http';
import { initSocket } from './socket';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const httpServer = createServer(app);
    initSocket(httpServer);

    // Start Express server
    httpServer.listen(env.PORT, () => {
      logger.info(`🚀 Streamkart API running on port ${env.PORT}`);
      logger.info(`📍 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
