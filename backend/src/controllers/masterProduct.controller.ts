import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MasterProduct } from '../models/MasterProduct';
import { Product } from '../models/Product';
import { Bundle } from '../models/Bundle';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';

// GET /api/master-products
export const getMasterProducts = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }
    
    // Sellers only see active master products
    if (req.user && req.user.role !== 'admin') {
      filter.status = 'active';
    } else if (req.query.status) {
      filter.status = req.query.status;
    }

    const [products, total] = await Promise.all([
      MasterProduct.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      MasterProduct.countDocuments(filter),
    ]);

    return sendPaginated(res, products, page, limit, total);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// GET /api/master-products/:id
export const getMasterProductById = async (req: Request, res: Response) => {
  try {
    const product = await MasterProduct.findById(req.params.id).lean();
    if (!product) return sendError(res, 'Master product not found.', 404);
    return sendSuccess(res, product);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// POST /api/master-products
export const createMasterProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, imageUrl, status, planNames } = req.body;

    const existingProduct = await MasterProduct.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingProduct) {
      return sendError(res, 'A master product with this name already exists.', 400);
    }

    const product = await MasterProduct.create({
      name,
      imageUrl,
      planNames: Array.isArray(planNames) ? planNames : [],
      status: status || 'active',
    });

    return sendSuccess(res, product, 'Master product created successfully.', 201);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// PUT /api/master-products/:id
export const updateMasterProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, imageUrl, status, planNames } = req.body;
    
    if (name) {
      const existingProduct = await MasterProduct.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingProduct) {
        return sendError(res, 'Another master product with this name already exists.', 400);
      }
    }

    const updateData: any = { name, imageUrl, status };
    if (planNames !== undefined) {
      updateData.planNames = Array.isArray(planNames) ? planNames : [];
    }

    const product = await MasterProduct.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) return sendError(res, 'Master product not found.', 404);
    return sendSuccess(res, product, 'Master product updated successfully.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// PATCH /api/master-products/:id/status
export const updateMasterProductStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return sendError(res, 'Invalid status.', 400);
    }

    const product = await MasterProduct.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!product) return sendError(res, 'Master product not found.', 404);
    return sendSuccess(res, product, 'Master product status updated.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

// DELETE /api/master-products/:id
export const deleteMasterProduct = async (req: AuthRequest, res: Response) => {
  try {
    // Check if referenced in existing Product listings
    const linkedProducts = await Product.countDocuments({ masterProduct: req.params.id });
    if (linkedProducts > 0) {
      return sendError(res, `Cannot delete: ${linkedProducts} active marketplace listings are currently using this master product. Please deactivate it instead.`, 400);
    }

    // Check if referenced in Bundles
    const linkedBundles = await Bundle.countDocuments({ 'products.masterProduct': req.params.id });
    if (linkedBundles > 0) {
      return sendError(res, `Cannot delete: ${linkedBundles} bundles are currently using this master product. Please deactivate it instead.`, 400);
    }

    const product = await MasterProduct.findByIdAndDelete(req.params.id);
    if (!product) return sendError(res, 'Master product not found.', 404);
    
    return sendSuccess(res, null, 'Master product deleted successfully.');
  } catch (error: any) {
    return sendError(res, error.message);
  }
};
