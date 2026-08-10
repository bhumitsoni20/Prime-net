import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env';
import { logger } from '../utils/logger';

// Workaround for Windows DNS SRV ECONNREFUSED issues
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    
    try {
      await conn.connection.collection('users').dropIndex('phone_1');
      logger.info('Dropped old phone_1 index from users collection');
    } catch (e: any) {
      if (e.code !== 27) {
        logger.warn('Could not drop phone_1 index:', e.message);
      }
    }
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
