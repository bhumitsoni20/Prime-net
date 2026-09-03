import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Spinner from '../components/ui/Spinner';
import { auth } from '../firebase/config';

const RoleRoute = ({ children, roles = [] }) => {
  const { user, isAuthenticated, loading } = useAuthStore();

  if (loading) return <Spinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (auth.currentUser && !auth.currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  
  if (roles.length > 0 && !roles.includes(user?.role)) {
    if (roles.includes('seller') && (user?.sellerStatus === 'pending' || user?.sellerStatus === 'rejected')) {
      return <Navigate to="/dashboard/seller-review" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  if (roles.includes('seller') && user?.role === 'seller') {
    if (user?.sellerStatus !== 'approved') {
      return <Navigate to="/dashboard/seller-review" replace />;
    }
  }

  return children;
};

export default RoleRoute;
