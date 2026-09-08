import { useState, useEffect, useMemo } from 'react';
import Badge from '../../components/ui/Badge';
import { apiGet, apiPut } from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { 
  HiSearch, 
  HiOutlineLightBulb, 
  HiOutlineFire, 
  HiOutlineCheckCircle, 
  HiOutlineClock,
  HiOutlineLink,
  HiOutlineUser
} from 'react-icons/hi';

const AdminProductRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [fulfillModal, setFulfillModal] = useState(null);
  const [productIdInput, setProductIdInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await apiGet('/requests');
      setRequests(res.data || []);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      setActionLoading(id);
      await apiPut(`/requests/${id}/status`, { status });
      toast.success('Status updated successfully');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFulfillClick = (id) => {
    setFulfillModal(id);
    setProductIdInput('');
  };

  const submitFulfill = async () => {
    if (!productIdInput.trim()) {
      toast.error('Product ID is required');
      return;
    }

    try {
      setActionLoading(fulfillModal);
      await apiPut(`/requests/${fulfillModal}/fulfill`, { productId: productIdInput.trim() });
      toast.success('Request fulfilled successfully!');
      setFulfillModal(null);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fulfill request');
    } finally {
      setActionLoading(null);
    }
  };

  const stats = useMemo(() => {
    const total = requests.length;
    const highPriority = requests.filter(r => r.priority === 'High').length;
    const fulfilled = requests.filter(r => r.status === 'Fulfilled').length;
    const pending = requests.filter(r => r.status === 'Pending' || r.status === 'In Progress').length;
    return { total, highPriority, fulfilled, pending };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        req.title?.toLowerCase().includes(q) ||
        req.category?.toLowerCase().includes(q) ||
        req.requestedBy?.name?.toLowerCase().includes(q) ||
        req.requestedBy?.email?.toLowerCase().includes(q);
      
      const matchesStatus = selectedStatus === 'all' || req.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[26px] font-extrabold text-[#0F172A] tracking-[-0.02em]">Product Demand Board</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF2FF] text-[#5B4BFF] border border-[#E0E7FF]">
              {requests.length} Requests
            </span>
          </div>
          <p className="text-[#64748B] text-[14px]">Monitor buyer-requested digital items and fulfill them by linking marketplace listings.</p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Total Requests</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#EEF2FF] text-[#5B4BFF] flex items-center justify-center">
              <HiOutlineLightBulb className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#0F172A]">{stats.total}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Buyer demand entries</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">High Priority</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center">
              <HiOutlineFire className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#EF4444]">{stats.highPriority}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Urgent requests</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Fulfilled</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <HiOutlineCheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#10B981]">{stats.fulfilled}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Linked with products</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Pending Sourcing</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center">
              <HiOutlineClock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#F59E0B]">{stats.pending}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Unmet requests</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F8FAFC] border border-[#F1F5F9] rounded-[16px] overflow-x-auto">
            {[
              { id: 'all', label: 'All Requests' },
              { id: 'Pending', label: 'Pending' },
              { id: 'In Progress', label: 'In Progress' },
              { id: 'Fulfilled', label: 'Fulfilled' },
              { id: 'Rejected', label: 'Rejected' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3.5 py-2 rounded-[12px] text-[13px] font-bold transition-all whitespace-nowrap ${
                  selectedStatus === tab.id
                    ? 'bg-white text-[#5B4BFF] shadow-sm border border-[#E2E8F0]'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-[300px]">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search request, category, user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-[14px] py-2.5 pl-10 pr-4 text-[13px] font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#5B4BFF] focus:ring-4 focus:ring-[#5B4BFF]/10 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-left text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] bg-[#F8FAFC]">
                <th className="p-4 pl-6">Requested Product</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Demand Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-[#94A3B8] font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-[#5B4BFF] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-semibold">Loading product demand stream...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-16 h-16 rounded-[20px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-2xl mb-4 shadow-sm">
                        💡
                      </div>
                      <h3 className="text-[17px] font-bold text-[#0F172A] mb-1">No product requests found</h3>
                      <p className="text-[13px] text-[#64748B] mb-4">No buyer demand matches your current filter.</p>
                      {(searchQuery || selectedStatus !== 'all') && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedStatus('all');
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-[#F8FAFC] transition-colors group">
                    {/* Product & Category */}
                    <td className="p-4 pl-6">
                      <div className="font-bold text-[14px] text-[#0F172A] group-hover:text-[#5B4BFF] transition-colors">
                        {request.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-semibold text-[#5B4BFF] bg-[#EEF2FF] px-2 py-0.5 rounded-[6px] capitalize">
                          {request.category || 'General'}
                        </span>
                        {request.budget && (
                          <span className="text-[11px] font-bold text-[#10B981]">
                            Budget: ₹{request.budget}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#F1F5F9] text-[#64748B] flex items-center justify-center font-bold text-[11px]">
                          {(request.requestedBy?.name || 'U').charAt(0)}
                        </div>
                        <span className="text-[13px] font-semibold text-[#334155]">
                          {request.requestedBy?.name || 'Anonymous'}
                        </span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-[11px] font-bold tracking-wide uppercase border ${
                        request.priority === 'High'
                          ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]'
                          : request.priority === 'Medium'
                          ? 'bg-[#FFF7ED] text-[#F97316] border-[#FFEDD5]'
                          : 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]'
                      }`}>
                        {request.priority || 'Normal'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <Badge variant={
                        request.status === 'Fulfilled' ? 'success' : 
                        request.status === 'Pending' ? 'warning' : 
                        request.status === 'In Progress' ? 'brand' : 'gray'
                      }>
                        {request.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {request.status !== 'Fulfilled' && request.status !== 'Rejected' && (
                          <>
                            {request.status === 'Pending' && (
                              <button
                                onClick={() => handleUpdateStatus(request._id, 'In Progress')}
                                disabled={actionLoading === request._id}
                                className="px-2.5 py-1 rounded-[8px] bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#5B4BFF] text-[12px] font-bold transition-colors"
                              >
                                Mark In Progress
                              </button>
                            )}
                            <Button 
                              size="sm" 
                              onClick={() => handleFulfillClick(request._id)}
                              isLoading={actionLoading === request._id}
                              className="font-bold text-[12px] px-3 py-1.5 rounded-[10px]"
                            >
                              <HiOutlineLink className="w-3.5 h-3.5 mr-1" /> Link Product
                            </Button>
                          </>
                        )}
                        {request.status === 'Fulfilled' && (
                          <span className="text-[#10B981] text-[12px] font-bold flex items-center gap-1">
                            <HiOutlineCheckCircle className="w-4 h-4" /> Fulfilled
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fulfill Product Modal */}
      <Modal isOpen={!!fulfillModal} onClose={() => setFulfillModal(null)} title="Link Product to Request">
        <div className="space-y-4 p-1">
          <p className="text-[14px] text-[#64748B] leading-relaxed">
            Enter the exact <span className="font-bold text-[#0F172A]">Product ID</span> from your catalog to link with this customer's demand request. The buyer will be notified that the requested subscription is now in stock.
          </p>
          <div>
            <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Marketplace Product ID
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-[14px] border border-[#E2E8F0] focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] outline-none text-[14px] font-mono font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
              placeholder="e.g. 660f58d92a4f6c001a4e..."
              value={productIdInput}
              onChange={(e) => setProductIdInput(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end pt-3 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setFulfillModal(null)}>
              Cancel
            </Button>
            <Button 
              onClick={submitFulfill} 
              isLoading={actionLoading === fulfillModal}
              className="bg-[#5B4BFF] hover:bg-[#4B3BE6] text-white"
            >
              Confirm Fulfillment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProductRequests;
