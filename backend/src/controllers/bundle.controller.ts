import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Bundle } from '../models/Bundle';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';

// GET /api/bundles/seller
export const getSellerBundles = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const filter: any = { seller: req.user._id };

    if (req.query.search) {
      filter.$text = { $search: req.query.search as string };
    }

    const sort: any = {};
    if (req.query.sort === 'price_asc') sort.bundlePrice = 1;
    else if (req.query.sort === 'price_desc') sort.bundlePrice = -1;
    else sort.createdAt = -1;

    const [bundles, total] = await Promise.all([
      Bundle.find(filter)
        .populate('products.product', 'title logo')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Bundle.countDocuments(filter),
    ]);

    return sendPaginated(res, bundles, page, limit, total);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/bundles/admin
export const getAdminBundles = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (req.query.search) {
      filter.$text = { $search: req.query.search as string };
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const sort: any = { createdAt: -1 };

    const [bundles, total] = await Promise.all([
      Bundle.find(filter)
        .populate('seller', 'name email avatar')
        .populate('products.product', 'title')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Bundle.countDocuments(filter),
    ]);

    return sendPaginated(res, bundles, page, limit, total);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/bundles
export const getBundles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const filter: any = { status: 'active', visibility: 'public' };

    if (req.query.category) {
      const categories = (req.query.category as string).split(',');
      filter.category = { $in: categories };
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search as string };
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.bundlePrice = {};
      if (req.query.minPrice) filter.bundlePrice.$gte = parseFloat(req.query.minPrice as string);
      if (req.query.maxPrice) filter.bundlePrice.$lte = parseFloat(req.query.maxPrice as string);
    }
    if (req.query.minRating) {
      filter.ratings = { $gte: parseFloat(req.query.minRating as string) };
    }
    if (req.query.seller) {
      filter.seller = req.query.seller;
    }

    const sort: any = {};
    if (req.query.sort === 'price_asc') sort.bundlePrice = 1;
    else if (req.query.sort === 'price_desc') sort.bundlePrice = -1;
    else if (req.query.sort === 'rating') sort.ratings = -1;
    else sort.createdAt = -1;

    const [bundles, total] = await Promise.all([
      Bundle.find(filter)
        .populate('seller', 'name avatar')
        .populate('products.product', 'title logo')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Bundle.countDocuments(filter),
    ]);

    return sendPaginated(res, bundles, page, limit, total);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/bundles/:id
export const getBundle = async (req: Request, res: Response) => {
  try {
    const bundle = await Bundle.findById(req.params.id)
      .populate('seller', 'name avatar email')
      .populate('products.product', 'title logo category features ratings')
      .lean();
      
    if (!bundle) return sendError(res, 'Bundle not found.', 404);

    return sendSuccess(res, bundle);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// POST /api/bundles
export const createBundle = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, thumbnail, bannerImage, tags, visibility, products, bundlePrice, originalPrice, duration } = req.body;

    if (!products || products.length < 2) {
      return sendError(res, 'A bundle must contain at least 2 products', 400);
    }

    const bundle = await Bundle.create({
      title,
      description,
      category,
      thumbnail,
      bannerImage,
      tags,
      visibility,
      products,
      bundlePrice,
      originalPrice,
      duration,
      seller: req.user._id,
      status: 'active', // Automatically approve for now
    });

    return sendSuccess(res, bundle, 'Bundle created.', 201);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// PUT /api/bundles/:id
export const updateBundle = async (req: AuthRequest, res: Response) => {
  try {
    const bundle = await Bundle.findById(req.params.id);
    if (!bundle) return sendError(res, 'Bundle not found.', 404);

    if (bundle.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to update this bundle.', 403);
    }

    const updatedBundle = await Bundle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    return sendSuccess(res, updatedBundle);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// DELETE /api/bundles/:id
export const deleteBundle = async (req: AuthRequest, res: Response) => {
  try {
    const bundle = await Bundle.findById(req.params.id);
    if (!bundle) return sendError(res, 'Bundle not found.', 404);

    if (bundle.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to delete this bundle.', 403);
    }

    await bundle.deleteOne();

    return sendSuccess(res, { message: 'Bundle deleted successfully' });
  } catch (error: any) {
    return sendError(res, error.message);
  }
};
