import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../../services/api';
import { io } from 'socket.io-client';
import useAuthStore from '../../store/authStore';
import { HiPlus, HiClock, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_API_URL.replace('/api', '');

const getStatusBadge = (status) => {
  switch (status) {
    case 'Pending':
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full border border-yellow-200">Pending</span>;
    case 'Under Review':
      return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-200">Under Review</span>;
    case 'Accepted':
    case 'In Progress':
      return <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full border border-indigo-200">In Progress</span>;
    case 'Fulfilled':
      return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-200 flex items-center gap-1"><HiCheckCircle /> Fulfilled</span>;
    case 'Rejected':
    case 'Cancelled':
      return <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full border border-red-200 flex items-center gap-1"><HiXCircle /> Cancelled</span>;
    default:
      return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full border border-gray-200">{status}</span>;
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return 'text-red-600 bg-red-50';
    case 'Medium': return 'text-orange-600 bg-orange-50';
    case 'Low': return 'text-gray-600 bg-gray-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token } = useAuthStore();

  useEffect(() => {
    fetchRequests();

    if (token) {
      const socket = io(SOCKET_URL, { auth: { token } });
      
      socket.on('request_updated', (updatedRequest) => {
        setRequests(prev => prev.map(req => req._id === updatedRequest._id ? updatedRequest : req));
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [token]);

  const fetchRequests = async () => {
    try {
      const res = await apiGet('/requests/me');
      setRequests(res.data || []);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B4BFF]" /></div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Product Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Track the status of products you've requested</p>
        </div>
        <Button onClick={() => navigate('/request-product')} className="gap-2 shadow-md">
          <HiPlus /> New Request
        </Button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiClock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
          <p className="text-gray-500 mb-6">You haven't requested any products yet.</p>
          <Button onClick={() => navigate('/request-product')} variant="outline">
            Request a Product
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                {getStatusBadge(request.status)}
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${getPriorityColor(request.priority)}`}>
                  {request.priority} Priority
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{request.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{request.description}</p>
              
              <div className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                <HiClock className="w-4 h-4" /> 
                Requested on {new Date(request.createdAt).toLocaleDateString()}
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100">
                {request.status === 'Fulfilled' ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/30"
                      onClick={() => navigate(`/products/${request.fulfilledProduct?._id || request.fulfilledProduct}`)}
                    >
                      Purchase Now
                    </Button>
                  </motion.div>
                ) : (
                  <div className="text-sm text-center py-2 bg-gray-50 rounded-lg text-gray-600 font-medium">
                    {request.status === 'Pending' && 'Waiting for sellers...'}
                    {request.status === 'Under Review' && 'Currently being reviewed...'}
                    {(request.status === 'Accepted' || request.status === 'In Progress') && 'A seller is working on this!'}
                    {(request.status === 'Rejected' || request.status === 'Cancelled') && 'Request closed'}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
