import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { Cache } from './utils/cache';

// Route imports
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import masterProductRoutes from './routes/masterProduct.routes';
import orderRoutes from './routes/order.routes';
import cartRoutes from './routes/cart.routes';
import paymentRoutes from './routes/payment.routes';
import paymentVerificationRoutes from './routes/paymentVerification.routes';
import notificationRoutes from './routes/notification.routes';
import reviewRoutes from './routes/review.routes';
import adminRoutes from './routes/admin.routes';
import sellerRoutes from './routes/seller.routes';
import productRequestRoutes from './routes/productRequest.routes';
import supportRoutes from './routes/support.routes';
import bundleRoutes from './routes/bundle.routes';
import bundleOrderRoutes from './routes/bundleOrder.routes';
import couponRoutes from './routes/coupon.routes';
import payoutRoutes from './routes/payout.routes';

const app = express();

app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());
app.use(compression());

const allowedOrigins = [
  'https://streamkart.in',
  'https://www.streamkart.in',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];
if (env.CLIENT_URL && !allowedOrigins.includes(env.CLIENT_URL)) {
  allowedOrigins.push(env.CLIENT_URL);
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        console.warn(`Blocked CORS request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(apiLimiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Streamkart API is running', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/master-products', masterProductRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payment-verifications', paymentVerificationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/requests', productRequestRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/bundles', bundleRoutes);
app.use('/api/bundle-orders', bundleOrderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payouts', payoutRoutes);

import { User } from './models/User';
import { sendSuccess, sendError } from './utils/response';
import { Product } from './models/Product';
import { Bundle } from './models/Bundle';

app.get('/api/public/stats', async (_req, res) => {
  try {
    const cachedStats = Cache.get('public_stats');
    
    res.setHeader('Cache-Control', 'public, max-age=300');

    if (cachedStats) {
      return sendSuccess(res, cachedStats);
    }

    const totalUsers = await User.countDocuments();
    
    const categoryCounts = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const categories = categoryCounts.reduce((acc: any, curr: any) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const bundleCount = await Bundle.countDocuments({ status: 'active', visibility: 'public' });
    categories['bundles'] = bundleCount;

    const stats = { totalUsers, categories };
    Cache.set('public_stats', stats, 300);

    return sendSuccess(res, stats);
  } catch (error: any) {
    return sendError(res, error.message);
  }
});

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Error Handler
app.use(errorHandler);

export default app;

// reload
