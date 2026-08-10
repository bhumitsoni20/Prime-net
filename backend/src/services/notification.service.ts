import { firebaseMessaging } from '../config/firebase';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { logger } from '../utils/logger';

export const sendPushNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'order' | 'payment' | 'system' | 'promotion' = 'system',
  actionUrl?: string
) => {
  try {
    // Save to database
    await Notification.create({ user: userId, title, message, type, actionUrl });

    // Send FCM push notification
    const user = await User.findById(userId);
    if (user?.fcmToken) {
      await firebaseMessaging.send({
        token: user.fcmToken,
        notification: { title, body: message },
        data: { type, userId, ...(actionUrl && { actionUrl }) },
      });
    }

    logger.info(`Notification sent to user ${userId}: ${title}`);
  } catch (error) {
    logger.error('Failed to send notification:', error);
  }
};
