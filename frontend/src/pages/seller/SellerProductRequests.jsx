import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiGet, apiPost } from '../../services/api';
import { HiOutlineLightBulb, HiClock, HiCurrencyDollar } from 'react-icons/hi';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return 'text-red-600 bg-red-50';
    case 'Medium': return 'text-orange-600 bg-orange-50';
    case 'Low': return 'text-gray-600 bg-gray-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const SellerProductRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await apiGet('/requests');
      setRequests(res.data || []);
    } catch (error) {
      toast.error('Failed to load marketplace requests');
    } finally {
      setLoading(false);
    }
  };

  const handleExpressInterest = async (id) => {
    try {
      setActionLoading(id);
      await apiPost(`/requests/${id}/interest`);
      toast.success('Interest expressed successfully!');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to express interest');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B4BFF]" /></div>;
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Marketplace Demand</h1>
        <p className="text-sm text-gray-500 mt-1">Products currently requested by buyers. Fulfill these requests to guarantee a sale.</p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineLightBulb className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active requests</h3>
          <p className="text-gray-500">Check back later for new buyer requests.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {requests.map((request) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold text-[#5B4BFF] uppercase tracking-wider bg-[#5B4BFF]/10 px-2 py-1 rounded">
                  {request.category.replace('-', ' ')}
                </span>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${getPriorityColor(request.priority)}`}>
                  {request.priority} Priority
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{request.title}</h3>
              <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">{request.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                <div className="flex items-center gap-1">
                  <HiClock className="w-4 h-4" /> 
                  {new Date(request.createdAt).toLocaleDateString()}
                </div>
                {request.duration && (
                  <div className="flex items-center gap-1 text-indigo-600 font-medium">
                    <HiClock className="w-4 h-4" /> 
                    {request.duration} {request.duration === 1 ? 'Month' : 'Months'}
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                <div className="text-sm font-medium">
                  Status: <span className="text-indigo-600">{request.status}</span>
                </div>
                
                {(request.status === 'Pending' || request.status === 'Accepted' || request.status === 'Under Review') && (
                  <Button 
                    onClick={() => handleExpressInterest(request._id)}
                    isLoading={actionLoading === request._id}
                    className="shadow-sm"
                  >
                    I'm Interested
                  </Button>
                )}
                {request.status === 'In Progress' && (
                  <span className="text-sm text-gray-400 italic">Being fulfilled</span>
                )}
                {(request.status === 'Fulfilled' || request.status === 'Rejected' || request.status === 'Cancelled') && (
                  <span className="text-sm text-gray-400 italic">Closed</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerProductRequests;
