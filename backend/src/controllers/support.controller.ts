import { Request, Response } from 'express';
import { sendSupportTicketEmail } from '../services/email.service';
import { sendSuccess, sendError } from '../utils/response';

// POST /api/support/ticket
export const submitTicket = async (req: Request, res: Response) => {
  try {
    const { topic, subject, description, email } = req.body;

    if (!topic || !subject || !description || !email) {
      return sendError(res, 'Please provide topic, subject, description, and email', 400);
    }

    const emailSent = await sendSupportTicketEmail(topic, subject, description, email);

    if (emailSent) {
      return sendSuccess(res, null, 'Ticket submitted successfully', 200);
    } else {
      return sendError(res, 'Failed to send support ticket email', 500);
    }
  } catch (error) {
    return sendError(res, 'Server Error', 500, error);
  }
};
