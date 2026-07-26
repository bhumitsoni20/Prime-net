import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ProductRequest } from '../models/ProductRequest';
import { sendSuccess, sendError } from '../utils/response';
import { sendPushNotification } from '../services/notification.service';
import { sendRequestFulfilledEmail } from '../services/email.service';
import { getIO } from '../socket';
import { Product } from '../models/Product';
import { User } from '../models/User';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

// @desc    Create a new product request
// @route   POST /api/requests
// @access  Private (User)
export const createRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, description, priority, duration, referenceUrl, attachments } = req.body;

    const request = await ProductRequest.create({
      title,
      category,
      description,
      priority: priority || 'Medium',
      duration,
      referenceUrl,
      attachments,
      requestedBy: req.user._id,
      status: 'Pending',
    });

    // Notify admins (optional)
    const admins = await User.find({ role: 'admin' });
    admins.forEach((admin) => {
      sendPushNotification(
        admin._id.toString(),
        'New Product Request',
        `A new product request for "${title}" has been submitted.`
      );
    });

    sendSuccess(res, request, 'Product request submitted successfully', 201);
  } catch (error: any) {
    logger.error('Error in createRequest:', error);
    sendError(res, 'Server Error', 500);
  }
};

// @desc    Get user's product requests
// @route   GET /api/requests/me
// @access  Private (User)
export const getUserRequests = async (req: AuthRequest, res: Response) => {
  try {
    const requests = await ProductRequest.find({ requestedBy: req.user._id })
      .populate('fulfilledProduct', 'title price')
      .populate('seller', 'name')
      .sort({ createdAt: -1 });

    sendSuccess(res, requests, 'User requests fetched successfully', 200);
  } catch (error: any) {
    logger.error('Error in getUserRequests:', error);
    sendError(res, 'Server Error', 500);
  }
};

// @desc    Get all product requests (Marketplace/Admin)
// @route   GET /api/requests
// @access  Private (Seller/Admin)
export const getAllRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { status, category, priority } = req.query;
    let query: any = {};

    // Sellers can only see requests that are not fulfilled/rejected/cancelled unless they are the fulfiller
    if (req.user.role === 'seller') {
      query.status = { $in: ['Pending', 'Under Review', 'Accepted', 'In Progress'] };
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const requests = await ProductRequest.find(query)
      .populate('requestedBy', 'name')
      .populate('seller', 'name')
      .sort({ priority: -1, createdAt: -1 }); // High priority first

    sendSuccess(res, requests, 'Requests fetched successfully', 200);
  } catch (error: any) {
    logger.error('Error in getAllRequests:', error);
    sendError(res, 'Server Error', 500);
  }
};

// @desc    Update request status (Admin)
// @route   PUT /api/requests/:id/status
// @access  Private (Admin)
export const updateRequestStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status, adminNotes } = req.body;
    
    const request = await ProductRequest.findById(req.params.id);
    if (!request) {
      return sendError(res, 'Request not found', 404);
    }

    request.status = status;
    if (adminNotes) request.adminNotes = adminNotes;
    await request.save();

    // Notify requester
    sendPushNotification(
      request.requestedBy.toString(),
      'Request Status Updated',
      `Your request for "${request.title}" is now ${status}.`
    );

    getIO().emit('request_updated', request);

    sendSuccess(res, request, 'Status updated successfully', 200);
  } catch (error: any) {
    logger.error('Error in updateRequestStatus:', error);
    sendError(res, 'Server Error', 500);
  }
};

// @desc    Seller expresses interest in a request
// @route   POST /api/requests/:id/interest
// @access  Private (Seller)
export const expressInterest = async (req: AuthRequest, res: Response) => {
  try {
    const request = await ProductRequest.findById(req.params.id);
    if (!request) {
      return sendError(res, 'Request not found', 404);
    }

    if (request.status === 'Fulfilled' || request.status === 'Cancelled') {
      return sendError(res, 'Cannot express interest on this request', 400);
    }

    request.status = 'In Progress';
    request.seller = new mongoose.Types.ObjectId(req.user._id);
    await request.save();

    // Notify user
    sendPushNotification(
      request.requestedBy.toString(),
      'Seller Found',
      `A verified seller is now working on your request for "${request.title}".`
    );

    getIO().emit('request_updated', request);

    sendSuccess(res, request, 'Interest recorded successfully', 200);
  } catch (error: any) {
    logger.error('Error in expressInterest:', error);
    sendError(res, 'Server Error', 500);
  }
};

// @desc    Link a product to fulfill a request
// @route   PUT /api/requests/:id/fulfill
// @access  Private (Admin)
export const fulfillRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.body;

    const request = await ProductRequest.findById(req.params.id).populate('requestedBy', 'email name firebaseUid');
    if (!request) {
      return sendError(res, 'Request not found', 404);
    }

    const product = await Product.findById(productId).populate('seller', 'name');
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    request.status = 'Fulfilled';
    request.fulfilledAt = new Date();
    request.fulfilledProduct = product._id;
    request.seller = product.seller._id;
    await request.save();

    // Trigger Notification
    sendPushNotification(
      request.requestedBy._id.toString(),
      'Your requested product is available!',
      `The subscription you requested has been listed by a verified seller.`
    );

    // Trigger Email
    const user: any = request.requestedBy;
    const seller: any = product.seller;
    await sendRequestFulfilledEmail(
      user.email,
      user.name,
      product.title,
      product.price,
      seller.name || 'StreamKart Seller',
      product._id.toString()
    );

    request.emailSent = true;
    request.notificationSent = true;
    await request.save();

    getIO().emit('request_updated', request);

    sendSuccess(res, request, 'Request fulfilled successfully', 200);
  } catch (error: any) {
    logger.error('Error in fulfillRequest:', error);
    sendError(res, 'Server Error', 500);
  }
};
