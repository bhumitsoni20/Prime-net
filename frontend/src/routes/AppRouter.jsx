import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import AuthLayout from '../components/layouts/AuthLayout';
import DashboardLayout from '../components/layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import PageLoader from '../components/ui/PageLoader';

// Auth Pages (Lazy Loaded)
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const PhoneLogin = lazy(() => import('../pages/auth/PhoneLogin'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const VerifyEmail = lazy(() => import('../pages/auth/VerifyEmail'));

// Public Pages (Lazy Loaded)
const Home = lazy(() => import('../pages/marketplace/Home'));
const ProductList = lazy(() => import('../pages/marketplace/ProductList'));
const ProductDetail = lazy(() => import('../pages/marketplace/ProductDetail'));
const BundleDetail = lazy(() => import('../pages/marketplace/BundleDetail'));
const Search = lazy(() => import('../pages/marketplace/Search'));
const Checkout = lazy(() => import('../pages/marketplace/Checkout'));
const PaymentSuccess = lazy(() => import('../pages/marketplace/PaymentSuccess'));
const PaymentCancel = lazy(() => import('../pages/marketplace/PaymentCancel'));
const Cart = lazy(() => import('../pages/marketplace/Cart'));
const Wishlist = lazy(() => import('../pages/marketplace/Wishlist'));
const About = lazy(() => import('../pages/public/About'));
const Contact = lazy(() => import('../pages/public/Contact'));
const Privacy = lazy(() => import('../pages/public/Privacy'));
const Terms = lazy(() => import('../pages/public/Terms'));
const RefundPolicy = lazy(() => import('../pages/public/RefundPolicy'));
const SellerPolicy = lazy(() => import('../pages/public/SellerPolicy'));
const SellerVerificationPolicy = lazy(() => import('../pages/public/SellerVerificationPolicy'));
const NotFound = lazy(() => import('../pages/public/NotFound'));
const RequestProduct = lazy(() => import('../pages/public/RequestProduct'));

// Dashboard Pages (Lazy Loaded)
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const Orders = lazy(() => import('../pages/dashboard/Orders'));
const OrderDetail = lazy(() => import('../pages/dashboard/OrderDetail'));
const Chats = lazy(() => import('../pages/dashboard/Chats'));
const Profile = lazy(() => import('../pages/dashboard/Profile'));
const Notifications = lazy(() => import('../pages/marketplace/Notifications'));
const SellerApplication = lazy(() => import('../pages/dashboard/SellerApplication'));
const SellerReview = lazy(() => import('../pages/dashboard/SellerReview'));
const MyRequests = lazy(() => import('../pages/dashboard/MyRequests'));

// Seller Pages (Lazy Loaded)
const SellerDashboard = lazy(() => import('../pages/seller/SellerDashboard'));
const AddProduct = lazy(() => import('../pages/seller/AddProduct'));
const CreateBundle = lazy(() => import('../pages/seller/CreateBundle'));
const EditProduct = lazy(() => import('../pages/seller/EditProduct'));
const EditBundle = lazy(() => import('../pages/seller/EditBundle'));
const SellerProducts = lazy(() => import('../pages/seller/SellerProducts'));
const SellerOrders = lazy(() => import('../pages/seller/SellerOrders'));
const SellerProductRequests = lazy(() => import('../pages/seller/SellerProductRequests'));
const SellerBundles = lazy(() => import('../pages/seller/SellerBundles'));

// Admin Pages (Lazy Loaded)
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const ManageUsers = lazy(() => import('../pages/admin/ManageUsers'));
const ManageProducts = lazy(() => import('../pages/admin/ManageProducts'));
const ManageOrders = lazy(() => import('../pages/admin/ManageOrders'));
const ManageApplications = lazy(() => import('../pages/admin/ManageApplications'));
const AdminProductRequests = lazy(() => import('../pages/admin/AdminProductRequests'));
const AdminBundles = lazy(() => import('../pages/admin/AdminBundles'));
const ProductCatalog = lazy(() => import('../pages/admin/ProductCatalog'));

// Higher-order component to wrap lazy components in Suspense
const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: withSuspense(Home) },
      { path: 'products', element: withSuspense(ProductList) },
      { path: 'products/:id', element: withSuspense(ProductDetail) },
      { path: 'bundles/:id', element: withSuspense(BundleDetail) },
      { path: 'cart', element: withSuspense(Cart) },
      { path: 'wishlist', element: withSuspense(Wishlist) },
      { path: 'notifications', element: <ProtectedRoute>{withSuspense(Notifications)}</ProtectedRoute> },
      { path: 'search', element: withSuspense(Search) },
      { path: 'checkout', element: withSuspense(Checkout) },
      { path: 'payment/success', element: withSuspense(PaymentSuccess) },
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
    children: [
      { path: 'login', element: withSuspense(Login) },
      { path: 'register', element: withSuspense(Register) },
      { path: 'verify-email', element: withSuspense(VerifyEmail) },
      { path: 'phone-login', element: withSuspense(PhoneLogin) },
      { path: 'forgot-password', element: withSuspense(ForgotPassword) },
    ],
  },
  // Standalone OrderChat removed in favor of /dashboard/chats/:orderId
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
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
    children: [
      { index: true, element: withSuspense(SellerDashboard) },
      { path: 'products', element: withSuspense(SellerProducts) },
      { path: 'products/new', element: withSuspense(AddProduct) },
      { path: 'bundles/create', element: withSuspense(CreateBundle) },
      { path: 'products/:id/edit', element: withSuspense(EditProduct) },
      { path: 'bundles', element: withSuspense(SellerBundles) },
      { path: 'bundles/:id/edit', element: withSuspense(EditBundle) },
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
    children: [
      { index: true, element: withSuspense(AdminDashboard) },
      { path: 'users', element: withSuspense(ManageUsers) },
      { path: 'products/catalog', element: withSuspense(ProductCatalog) },
      { path: 'products', element: withSuspense(ManageProducts) },
      { path: 'bundles', element: withSuspense(AdminBundles) },
      { path: 'orders', element: withSuspense(ManageOrders) },
      { path: 'applications', element: withSuspense(ManageApplications) },
      { path: 'product-requests', element: withSuspense(AdminProductRequests) },
    ],
  },
  { path: '*', element: withSuspense(NotFound) },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
