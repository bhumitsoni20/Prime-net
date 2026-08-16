import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Product } from '../models/Product';
import { MasterProduct } from '../models/MasterProduct';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { Cache } from '../utils/cache';

// GET /api/products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const filter: any = { status: 'active' };

    if (req.query.category) {
      const categories = (req.query.category as string).split(',');
      filter.category = { $in: categories };
    }
    if (req.query.duration) {
      const durations = (req.query.duration as string).split(',').map(d => {
        const base = d.trim().replace(/s$/, ''); // remove trailing 's' if any
        return new RegExp(`^${base}s?$`, 'i');
      });
      filter.duration = { $in: durations };
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search as string };
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice as string);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice as string);
    }
    if (req.query.minRating) {
      filter.ratings = { $gte: parseFloat(req.query.minRating as string) };
    }

    const sort: any = {};
    if (req.query.sort === 'price_asc') sort.price = 1;
    else if (req.query.sort === 'price_desc') sort.price = -1;
    else if (req.query.sort === 'rating') sort.ratings = -1;
    else sort.createdAt = -1;

    const cacheKey = `products_${JSON.stringify(req.query)}`;
    let cachedData = Cache.get(cacheKey);

    if (cachedData) {
      return sendPaginated(res, cachedData.products, page, limit, cachedData.total);
    }

    const [products, total] = await Promise.all([
      Product.find(filter).populate('seller', 'name avatar').sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    Cache.set(cacheKey, { products, total }, 300); // Cache for 5 minutes (300 seconds)

    return sendPaginated(res, products, page, limit, total);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/products/:id
export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name avatar email').lean();
    if (!product) return sendError(res, 'Product not found.', 404);

    if (product.seller) {
      const sellerId = (product.seller as any)._id.toString();
      const cacheKey = `vendor_stats_${sellerId}`;
      let vendorStats = Cache.get(cacheKey);

      if (!vendorStats) {
        const stats = await Product.aggregate([
          { $match: { seller: (product.seller as any)._id } },
          { $group: { _id: null, totalSales: { $sum: '$totalSales' }, avgRating: { $avg: '$ratings' } } }
        ]);
        
        vendorStats = {
          totalSales: stats[0]?.totalSales || 0,
          ratings: stats[0]?.avgRating || 0
        };
        Cache.set(cacheKey, vendorStats, 300); // 5 mins
      }

      (product.seller as any).totalSales = vendorStats.totalSales;
      (product.seller as any).ratings = vendorStats.ratings;
    }

    return sendSuccess(res, product);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// POST /api/products
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { category, price, originalPrice, features, duration, masterProductId, planName, deviceLoginCount, deviceLoginType } = req.body;
    let { title, description, logo } = req.body;

    if (masterProductId) {
      const masterProduct = await MasterProduct.findById(masterProductId);
      if (masterProduct && masterProduct.status === 'active') {
        title = masterProduct.name;
        logo = masterProduct.imageUrl;
      } else {
        return sendError(res, 'Invalid or inactive Master Product.', 400);
      }
    }

    const product = await Product.create({
      title,
      description,
      category,
      logo,
      price,
      originalPrice,
      features,
      duration,
      planName,
      deviceLoginCount,
      deviceLoginType,
      masterProduct: masterProductId || undefined,
      seller: req.user._id,
      status: 'active', // Automatically approve products
    });

    Cache.clearAll();
    return sendSuccess(res, product, 'Product created and is now live.', 201);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// PUT /api/products/:id
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 'Product not found.', 404);

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized.', 403);
    }
    
    const updateData = { ...req.body };
    if (updateData.masterProductId) {
      const masterProduct = await MasterProduct.findById(updateData.masterProductId);
      if (masterProduct && masterProduct.status === 'active') {
        updateData.title = masterProduct.name;
        updateData.logo = masterProduct.imageUrl;
        updateData.masterProduct = updateData.masterProductId;
      } else {
        return sendError(res, 'Invalid or inactive Master Product.', 400);
      }
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    Cache.clearAll();
    return sendSuccess(res, updated, 'Product updated.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 'Product not found.', 404);

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized.', 403);
    }

    await Product.findByIdAndDelete(req.params.id);
    Cache.clearAll();
    return sendSuccess(res, null, 'Product deleted.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/products/seller/me
export const getSellerProducts = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ seller: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments({ seller: req.user._id }),
    ]);

    return sendPaginated(res, products, page, limit, total);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};
