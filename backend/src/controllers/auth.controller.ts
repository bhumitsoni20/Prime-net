import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { sendSuccess, sendError } from '../utils/response';
import { sendWelcomeEmail, sendCustomVerificationEmail, sendCustomPasswordResetEmail } from '../services/email.service';
import { env } from '../config/env';

// POST /api/auth/register
export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone } = req.body;
    const firebaseUser = req.firebaseUser;

    let user = await User.findOne({ 
      $or: [
        { firebaseUid: firebaseUser.uid },
        { email: email || firebaseUser.email }
      ]
    });

    if (user) {
      // If found by email but UID changed (e.g. Firebase project migration), update UID
      if (user.firebaseUid !== firebaseUser.uid) {
        user.firebaseUid = firebaseUser.uid;
        await user.save();
      }
      return sendSuccess(res, user, 'User already exists. Logged in.');
    }

    const isAdmin = env.ADMIN_EMAIL && (email || firebaseUser.email) === env.ADMIN_EMAIL;

    user = await User.create({
      name: name || firebaseUser.name || email?.split('@')[0] || 'User',
      email: email || firebaseUser.email || '',
      phone: phone || firebaseUser.phone_number || '',
      firebaseUid: firebaseUser.uid,
      avatar: firebaseUser.picture || '',
      isVerified: firebaseUser.email_verified || false,
      role: isAdmin ? 'admin' : 'user',
    });

    await sendWelcomeEmail(user.email, user.name);
    // Send our gorgeous custom HTML verification email!
    await sendCustomVerificationEmail(user.email, user.name);

    return sendSuccess(res, user, 'User registered successfully.', 201);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// POST /api/auth/login
export const login = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    return sendSuccess(res, user, 'Login successful.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 'User not found.', 404);
    return sendSuccess(res, user);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// PUT /api/auth/profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );

    if (!user) return sendError(res, 'User not found.', 404);
    return sendSuccess(res, user, 'Profile updated.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// PUT /api/auth/fcm-token
export const updateFCMToken = async (req: AuthRequest, res: Response) => {
  try {
    const { fcmToken } = req.body;

    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    return sendSuccess(res, null, 'FCM token updated.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// POST /api/auth/send-verification
export const sendVerificationEmail = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return sendError(res, 'User not found.', 404);
    
    // Use Firebase as the source of truth for verification status
    if (req.firebaseUser && req.firebaseUser.email_verified) {
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
      return sendError(res, 'Email already verified.', 400);
    }

    await sendCustomVerificationEmail(user.email, user.name);
    return sendSuccess(res, null, 'Verification email sent.');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to send verification email.', 500);
  }
};

// POST /api/auth/send-password-reset
export const sendPasswordReset = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 'Email is required.', 400);

    // Try to find the user to get their name for the email
    const user = await User.findOne({ email });
    const displayName = user ? user.name : '';

    const success = await sendCustomPasswordResetEmail(email, displayName);
    if (success) {
      return sendSuccess(res, null, 'Password reset email sent.');
    } else {
      return sendError(res, 'Failed to send password reset email.', 500);
    }
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      // Don't leak that the user wasn't found for security, just pretend it sent
      return sendSuccess(res, null, 'If that email exists, a reset link was sent.');
    }
    return sendError(res, error.message);
  }
};

// PUT /api/auth/become-seller
export const becomeSeller = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return sendError(res, 'User not found.', 404);

    if (user.role === 'seller' || user.role === 'admin') {
      return sendError(res, 'User is already a seller or admin.', 400);
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { role: 'seller' },
      { new: true, runValidators: true }
    );

    return sendSuccess(res, updatedUser, 'Successfully upgraded to seller account!');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};
