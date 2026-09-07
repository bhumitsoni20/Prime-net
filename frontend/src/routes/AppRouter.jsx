import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import AuthLayout from '../components/layouts/AuthLayout';
import DashboardLayout from '../components/layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import PageLoader from '../components/ui/PageLoader';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Helper to catch dynamic import chunk errors (due to new live site deployments) and reload automatically
const safeLazy = (importFn) => {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.error('Failed to load route module:', error);
      const isChunkError =
        error?.name === 'TypeError' ||
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('Importing a module script failed');

      if (isChunkError) {
        const reloadKey = 'streamkart_chunk_reload_count';
        const reloadCount = parseInt(sessionStorage.getItem(reloadKey) || '0', 10);
        if (reloadCount < 2) {
          sessionStorage.setItem(reloadKey, (reloadCount + 1).toString());
          window.location.reload();
          return new Promise(() => {}); // Wait for window reload
        }
      }
      throw error;
    }
  });
};

// Auth Pages (Lazy Loaded)
const Login = safeLazy(() => import('../pages/auth/Login'));
const Register = safeLazy(() => import('../pages/auth/Register'));
const PhoneLogin = safeLazy(() => import('../pages/auth/PhoneLogin'));
const ForgotPassword = safeLazy(() => import('../pages/auth/ForgotPassword'));
const VerifyEmail = safeLazy(() => import('../pages/auth/VerifyEmail'));

// Public / Marketplace Pages (Lazy Loaded)
const Home = safeLazy(() => import('../pages/marketplace/Home'));
const ProductList = safeLazy(() => import('../pages/marketplace/ProductList'));
const ProductDetail = safeLazy(() => import('../pages/marketplace/ProductDetail'));
const BundleDetail = safeLazy(() => import('../pages/marketplace/BundleDetail'));
const Search = safeLazy(() => import('../pages/marketplace/Search'));
const Checkout = safeLazy(() => import('../pages/marketplace/Checkout'));
const PaymentCancel = safeLazy(() => import('../pages/marketplace/PaymentCancel'));
const PaymentVerificationPending = safeLazy(() => import('../pages/marketplace/PaymentVerificationPending'));
const Cart = safeLazy(() => import('../pages/marketplace/Cart'));
const Wishlist = safeLazy(() => import('../pages/marketplace/Wishlist'));
const About = safeLazy(() => import('../pages/public/About'));
const Contact = safeLazy(() => import('../pages/public/Contact'));
const Privacy = safeLazy(() => import('../pages/public/Privacy'));
const Terms = safeLazy(() => import('../pages/public/Terms'));
const RefundPolicy = safeLazy(() => import('../pages/public/RefundPolicy'));
const SellerPolicy = safeLazy(() => import('../pages/public/SellerPolicy'));
const SellerVerificationPolicy = safeLazy(() => import('../pages/public/SellerVerificationPolicy'));
const NotFound = safeLazy(() => import('../pages/public/NotFound'));
const RequestProduct = safeLazy(() => import('../pages/public/RequestProduct'));
const Maintenance = safeLazy(() => import('../pages/public/Maintenance'));

// Dashboard Pages (Lazy Loaded)
const Dashboard = safeLazy(() => import('../pages/dashboard/Dashboard'));
const Orders = safeLazy(() => import('../pages/dashboard/Orders'));
const OrderDetail = safeLazy(() => import('../pages/dashboard/OrderDetail'));
const Chats = safeLazy(() => import('../pages/dashboard/Chats'));
const Profile = safeLazy(() => import('../pages/dashboard/Profile'));
const Notifications = safeLazy(() => import('../pages/marketplace/Notifications'));
const SellerApplication = safeLazy(() => import('../pages/dashboard/SellerApplication'));
const SellerReview = safeLazy(() => import('../pages/dashboard/SellerReview'));
const MyRequests = safeLazy(() => import('../pages/dashboard/MyRequests'));

// Seller Pages (Lazy Loaded)
const SellerDashboard = safeLazy(() => import('../pages/seller/SellerDashboard'));
const AddProduct = safeLazy(() => import('../pages/seller/AddProduct'));
const CreateBundle = safeLazy(() => import('../pages/seller/CreateBundle'));
const EditProduct = safeLazy(() => import('../pages/seller/EditProduct'));
const EditBundle = safeLazy(() => import('../pages/seller/EditBundle'));
const SellerProducts = safeLazy(() => import('../pages/seller/SellerProducts'));
const SellerOrders = safeLazy(() => import('../pages/seller/SellerOrders'));
const SellerProductRequests = safeLazy(() => import('../pages/seller/SellerProductRequests'));
const SellerBundles = safeLazy(() => import('../pages/seller/SellerBundles'));
const SellerWallet = safeLazy(() => import('../pages/seller/SellerWallet'));

// Admin Pages (Lazy Loaded)
const AdminDashboard = safeLazy(() => import('../pages/admin/AdminDashboard'));
const ManageUsers = safeLazy(() => import('../pages/admin/ManageUsers'));
const ManageProducts = safeLazy(() => import('../pages/admin/ManageProducts'));
const ManageOrders = safeLazy(() => import('../pages/admin/ManageOrders'));
const ManageApplications = safeLazy(() => import('../pages/admin/ManageApplications'));
const AdminProductRequests = safeLazy(() => import('../pages/admin/AdminProductRequests'));
const AdminBundles = safeLazy(() => import('../pages/admin/AdminBundles'));
const ProductCatalog = safeLazy(() => import('../pages/admin/ProductCatalog'));
const ManagePayments = safeLazy(() => import('../pages/admin/ManagePayments'));
const PaymentSettings = safeLazy(() => import('../pages/admin/PaymentSettings'));
const AdminCoupons = safeLazy(() => import('../pages/admin/AdminCoupons'));
const ManagePayouts = safeLazy(() => import('../pages/admin/ManagePayouts'));

// Higher-order component to wrap lazy components in Suspense
const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

// Standard Full Website Router
const standardRouter = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: withSuspense(Home) },
      { path: 'products', element: withSuspense(ProductList) },
      { path: 'products/:id', element: withSuspense(ProductDetail) },
      { path: 'bundles/:id', element: withSuspense(BundleDetail) },
      { path: 'cart', element: withSuspense(Cart) },
      { path: 'wishlist', element: withSuspense(Wishlist) },
      { path: 'notifications', element: <ProtectedRoute>{withSuspense(Notifications)}</ProtectedRoute> },
      { path: 'payment-pending', element: <ProtectedRoute>{withSuspense(PaymentVerificationPending)}</ProtectedRoute> },
      { path: 'search', element: withSuspense(Search) },
      { path: 'checkout', element: withSuspense(Checkout) },
      { path: 'payment/cancel', element: withSuspense(PaymentCancel) },
      { path: 'about', element: withSuspense(About) },
      { path: 'contact', element: withSuspense(Contact) },
      { path: 'privacy', element: withSuspense(Privacy) },
      { path: 'terms', element: withSuspense(Terms) },
      { path: 'refund', element: withSuspense(RefundPolicy) },
      { path: 'seller-policy', element: withSuspense(SellerPolicy) },
      { path: 'seller-verification-policy', element: withSuspense(SellerVerificationPolicy) },
      { path: 'request-product', element: withSuspense(RequestProduct) },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: 'login', element: withSuspense(Login) },
      { path: 'register', element: withSuspense(Register) },
      { path: 'verify-email', element: withSuspense(VerifyEmail) },
      { path: 'phone-login', element: withSuspense(PhoneLogin) },
      { path: 'forgot-password', element: withSuspense(ForgotPassword) },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: withSuspense(Dashboard) },
      { path: 'orders', element: withSuspense(Orders) },
      { path: 'orders/:id', element: withSuspense(OrderDetail) },
      { path: 'chats', element: withSuspense(Chats) },
      { path: 'chats/:orderId', element: withSuspense(Chats) },
      { path: 'profile', element: withSuspense(Profile) },
      { path: 'apply-seller', element: withSuspense(SellerApplication) },
      { path: 'seller-review', element: withSuspense(SellerReview) },
      { path: 'my-requests', element: withSuspense(MyRequests) },
    ],
  },
  {
    path: '/seller',
    element: (
      <RoleRoute roles={['seller', 'admin']}>
        <DashboardLayout />
      </RoleRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: withSuspense(SellerDashboard) },
      { path: 'products', element: withSuspense(SellerProducts) },
      { path: 'products/new', element: withSuspense(AddProduct) },
      { path: 'bundles/create', element: withSuspense(CreateBundle) },
      { path: 'products/:id/edit', element: withSuspense(EditProduct) },
      { path: 'bundles', element: withSuspense(SellerBundles) },
      { path: 'bundles/:id/edit', element: withSuspense(EditBundle) },
      { path: 'wallet', element: withSuspense(SellerWallet) },
      { path: 'orders', element: withSuspense(SellerOrders) },
      { path: 'product-requests', element: withSuspense(SellerProductRequests) },
    ],
  },
  {
    path: '/admin',
    element: (
      <RoleRoute roles={['admin']}>
        <DashboardLayout />
      </RoleRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: withSuspense(AdminDashboard) },
      { path: 'users', element: withSuspense(ManageUsers) },
      { path: 'products/catalog', element: withSuspense(ProductCatalog) },
      { path: 'products', element: withSuspense(ManageProducts) },
      { path: 'bundles', element: withSuspense(AdminBundles) },
      { path: 'orders', element: withSuspense(ManageOrders) },
      { path: 'applications', element: withSuspense(ManageApplications) },
      { path: 'product-requests', element: withSuspense(AdminProductRequests) },
      { path: 'payments', element: withSuspense(ManagePayments) },
      { path: 'payment-settings', element: withSuspense(PaymentSettings) },
      { path: 'payouts', element: withSuspense(ManagePayouts) },
      { path: 'coupons', element: withSuspense(AdminCoupons) },
    ],
  },
  { path: '*', element: withSuspense(NotFound), errorElement: <ErrorBoundary /> },
]);

// Dedicated Maintenance Router - Preserves Admin Access while gating public routes
const maintenanceRouter = createBrowserRouter([
  {
    path: '/admin',
    element: (
      <RoleRoute roles={['admin']}>
        <DashboardLayout />
      </RoleRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: withSuspense(AdminDashboard) },
      { path: 'users', element: withSuspense(ManageUsers) },
      { path: 'products/catalog', element: withSuspense(ProductCatalog) },
      { path: 'products', element: withSuspense(ManageProducts) },
      { path: 'bundles', element: withSuspense(AdminBundles) },
      { path: 'orders', element: withSuspense(ManageOrders) },
      { path: 'applications', element: withSuspense(ManageApplications) },
      { path: 'product-requests', element: withSuspense(AdminProductRequests) },
      { path: 'payments', element: withSuspense(ManagePayments) },
      { path: 'payment-settings', element: withSuspense(PaymentSettings) },
      { path: 'payouts', element: withSuspense(ManagePayouts) },
      { path: 'coupons', element: withSuspense(AdminCoupons) },
    ],
  },
  {
    path: '*',
    element: withSuspense(Maintenance),
    errorElement: <ErrorBoundary />,
  },
]);

// Controlled via MAINTENANCE_MODE or VITE_MAINTENANCE_MODE in .env
const envVal = import.meta.env.MAINTENANCE_MODE ?? import.meta.env.VITE_MAINTENANCE_MODE;
const isMaintenanceActive = envVal === 'true';
const activeRouter = isMaintenanceActive ? maintenanceRouter : standardRouter;

const AppRouter = () => (
  <ErrorBoundary>
    <RouterProvider router={activeRouter} />
  </ErrorBoundary>
);

export default AppRouter;
