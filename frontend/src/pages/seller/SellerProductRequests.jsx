import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { apiGet, apiPost } from '../../services/api';
import { 
  HiOutlineLightBulb, 
  HiClock, 
  HiSearch, 
  HiOutlineFire, 
  HiOutlineTag,
  HiCheckCircle,
  HiOutlineSparkles
} from 'react-icons/hi';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const SellerProductRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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
      toast.success('Interest expressed successfully! Administration has been notified.');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to express interest');
    } finally {
      setActionLoading(null);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(requests.map(r => r.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [requests]);

  const stats = useMemo(() => {
    const total = requests.length;
    const highPriority = requests.filter(r => r.priority === 'High').length;
    const openForBidding = requests.filter(r => r.status === 'Pending' || r.status === 'Accepted' || r.status === 'Under Review').length;
    return { total, highPriority, openForBidding };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        req.title?.toLowerCase().includes(q) ||
        req.description?.toLowerCase().includes(q) ||
        req.category?.toLowerCase().includes(q);

      const matchesCategory = selectedCategory === 'all' || req.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [requests, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Spinner size="lg" />
        <span className="text-sm font-semibold text-[#64748B]">Loading buyer demand requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[26px] font-extrabold text-[#0F172A] tracking-[-0.02em]">Marketplace Demand Board</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF2FF] text-[#5B4BFF] border border-[#E0E7FF]">
              {requests.length} Buyer Inquiries
            </span>
          </div>
          <p className="text-[#64748B] text-[14px]">Products currently requested by buyers. Express interest or list items to fulfill guaranteed demand.</p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Total Inquiries</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#EEF2FF] text-[#5B4BFF] flex items-center justify-center">
              <HiOutlineLightBulb className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#0F172A]">{stats.total}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Submitted by active buyers</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">High Priority</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center">
              <HiOutlineFire className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#EF4444]">{stats.highPriority}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Urgent buyer requirements</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Open for Sourcing</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <HiOutlineSparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#10B981]">{stats.openForBidding}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Ready for seller fulfillment</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F8FAFC] border border-[#F1F5F9] rounded-[16px] overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-[12px] text-[13px] font-bold transition-all whitespace-nowrap capitalize ${
                  selectedCategory === cat
                    ? 'bg-white text-[#5B4BFF] shadow-sm border border-[#E2E8F0]'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/50'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-[280px]">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search demand requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-[14px] py-2.5 pl-10 pr-4 text-[13px] font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#5B4BFF] focus:ring-4 focus:ring-[#5B4BFF]/10 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Demand Cards Grid */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="w-16 h-16 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[20px] flex items-center justify-center mx-auto mb-4 shadow-sm text-2xl">
            💡
          </div>
          <h3 className="text-[18px] font-bold text-[#0F172A] mb-1.5">No Demand Requests Found</h3>
          <p className="text-[#64748B] text-[14px] max-w-sm mx-auto mb-4">
            {searchQuery || selectedCategory !== 'all'
              ? 'No buyer requests match your current search or category filter.'
              : 'Check back later for newly submitted buyer demand.'}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredRequests.map((request) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md p-6 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[11px] font-extrabold text-[#5B4BFF] uppercase tracking-wider bg-[#EEF2FF] px-2.5 py-1 rounded-[8px] border border-[#E0E7FF] capitalize">
                    {request.category?.replace('-', ' ') || 'Subscription'}
                  </span>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-[8px] border ${
                    request.priority === 'High'
                      ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]'
                      : request.priority === 'Medium'
                      ? 'bg-[#FFF7ED] text-[#F97316] border-[#FFEDD5]'
                      : 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]'
                  }`}>
                    {request.priority || 'Normal'} Priority
                  </span>
                </div>
                
                <h3 className="text-[18px] font-extrabold text-[#0F172A] mb-2">{request.title}</h3>
                
                <div className="text-[13.5px] text-[#475569] mb-4 bg-[#F8FAFC] p-3.5 rounded-[14px] border border-[#E2E8F0] leading-relaxed">
                  {request.description || 'No specific notes provided by customer.'}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#64748B] mb-5">
                  <div className="flex items-center gap-1.5 font-medium">
                    <HiClock className="w-4 h-4 text-[#94A3B8]" /> 
                    {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  {request.duration && (
                    <div className="flex items-center gap-1 text-[#5B4BFF] font-bold bg-[#EEF2FF] px-2 py-0.5 rounded-[6px]">
                      ⏱️ {request.duration} {typeof request.duration === 'number' ? (request.duration === 1 ? 'Month' : 'Months') : ''}
                    </div>
                  )}
                  {request.budget && (
                    <div className="text-[#10B981] font-bold">
                      Budget: ₹{request.budget}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#F1F5F9] flex justify-between items-center">
                <div className="text-[13px] font-semibold text-[#475569]">
                  Status: <span className="text-[#5B4BFF] font-bold">{request.status}</span>
                </div>
                
                {(request.status === 'Pending' || request.status === 'Accepted' || request.status === 'Under Review') && (
                  <Button 
                    onClick={() => handleExpressInterest(request._id)}
                    isLoading={actionLoading === request._id}
                    size="sm"
                    className="shadow-sm font-bold text-[12.5px] px-4 py-2"
                  >
                    I Can Fulfill This
                  </Button>
                )}
                {request.status === 'In Progress' && (
                  <span className="text-[12px] text-[#F59E0B] font-bold bg-[#FFFBEB] px-2.5 py-1 rounded-[6px] border border-[#FDE68A]">
                    Being Fulfilled
                  </span>
                )}
                {(request.status === 'Fulfilled' || request.status === 'Rejected' || request.status === 'Cancelled') && (
                  <span className="text-[12px] text-[#64748B] font-semibold bg-[#F1F5F9] px-2.5 py-1 rounded-[6px]">
                    Closed
                  </span>
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
