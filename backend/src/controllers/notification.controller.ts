import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { getIO } from '../socket';

// GET /api/notifications
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user: req.user._id }),
    ]);

    return sendPaginated(res, notifications, page, limit, total);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });
    return sendSuccess(res, { count });
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// PUT /api/notifications/:id/read
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) return sendError(res, 'Notification not found.', 404);
    try {
      getIO().to(`user_${req.user._id.toString()}`).emit('notifications_read');
    } catch (err) {}
    return sendSuccess(res, notification, 'Marked as read.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// PUT /api/notifications/read-all
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );
    try {
      getIO().to(`user_${req.user._id.toString()}`).emit('notifications_read');
    } catch (err) {}
    return sendSuccess(res, null, 'All notifications marked as read.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};
