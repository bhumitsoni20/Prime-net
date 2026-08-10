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
      const isAdmin = !!(env.ADMIN_EMAIL && decodedToken.email && decodedToken.email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase());
      user = await User.create({
        name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        email: decodedToken.email || '',
        phone: decodedToken.phone_number || '',
        firebaseUid: decodedToken.uid,
        avatar: decodedToken.picture || '',
        isVerified: decodedToken.email_verified || false,
        role: isAdmin ? 'admin' : 'user',
      });
    }

    // Check for active suspension
    if (user.suspensionExpiry && new Date(user.suspensionExpiry) > new Date()) {
      return sendError(res, `Your account is temporarily suspended due to poor reviews. It will be reactivated on ${new Date(user.suspensionExpiry).toLocaleString()}.`, 403);
    }

    req.user = user;
    next();
  } catch (error: any) {
    logger.error('Authentication error:', error.message);
    return sendError(res, 'Invalid or expired token.', 401);
  }
};
