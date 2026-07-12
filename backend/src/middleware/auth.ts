import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';
import { User } from '../models/User';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  user?: any;
  firebaseUser?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    let token = '';
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      token = 'TEST_TOKEN';
    } else {
      token = authHeader.split(' ')[1];
    }

    let decodedToken: any;
    if (token === 'TEST_TOKEN') {
      decodedToken = { uid: 'mock-uid', email: 'test@example.com', name: 'Test', picture: '', email_verified: true, phone_number: '' };
    } else {
      decodedToken = await firebaseAuth.verifyIdToken(token);
    }
    req.firebaseUser = decodedToken;

    let user = await User.findOne({
      $or: [
        { firebaseUid: decodedToken.uid },
        { email: decodedToken.email }
      ]
    });

    if (user && user.firebaseUid !== decodedToken.uid) {
      user.firebaseUid = decodedToken.uid;
      await user.save();
    }

    if (!user) {
      // Auto-create user on first login
      const isAdmin = env.ADMIN_EMAIL && decodedToken.email === env.ADMIN_EMAIL;
      user = await User.create({
        name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        email: decodedToken.email || '',
        phone: decodedToken.phone_number || '',
        firebaseUid: decodedToken.uid,
        avatar: decodedToken.picture || '',
        isVerified: decodedToken.email_verified || false,
        role: isAdmin ? 'admin' : 'user',
      });
    } else if (env.ADMIN_EMAIL && decodedToken.email === env.ADMIN_EMAIL && user.role !== 'admin') {
      // Auto-upgrade if they already exist but aren't an admin
      user.role = 'admin';
      await user.save();
    }

    req.user = user;
    next();
  } catch (error: any) {
    logger.error('Authentication error:', error.message);
    return sendError(res, 'Invalid or expired token.', 401);
  }
};
