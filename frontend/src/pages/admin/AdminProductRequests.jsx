import { useState, useEffect } from 'react';
import Badge from '../../components/ui/Badge';
import { apiGet, apiPut } from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const AdminProductRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [fulfillModal, setFulfillModal] = useState(null);
  const [productIdInput, setProductIdInput] = useState('');

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
      toast.success('Status updated');
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

  if (loading) {
    return <div className="p-12 text-center text-[#94A3B8] font-medium animate-pulse">Loading requests...</div>;
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em] mb-1">Product Requests Administration</h1>
          <p className="text-[#64748B] text-[15px]">View and moderate all product requests submitted by buyers.</p>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-left text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] bg-[#F8FAFC]">
                <th className="p-5 pl-6">Product & Category</th>
                <th className="p-5">Requested By</th>
                <th className="p-5">Priority</th>
                <th className="p-5">Status</th>
                <th className="p-5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {requests.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-[#64748B] font-medium bg-[#F8FAFC]">No product requests found.</td></tr>
              ) : (
                requests.map((request) => (
                  <tr key={request._id} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="p-5 pl-6">
                      <div className="font-bold text-[14px] text-[#0F172A] group-hover:text-[#5B4BFF] transition-colors">{request.title}</div>
                      <div className="text-[#94A3B8] text-[12px] font-medium mt-0.5 uppercase tracking-wide">{request.category}</div>
                    </td>
                    <td className="p-5 text-[14px] font-semibold text-[#475569]">{request.requestedBy?.name || 'Unknown'}</td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold tracking-wide uppercase ${
                        request.priority === 'High' ? 'bg-[#FEF2F2] text-[#EF4444]' :
                        request.priority === 'Medium' ? 'bg-[#FFF7ED] text-[#F97316]' : 'bg-[#F1F5F9] text-[#64748B]'
                      }`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="p-5">
                      <Badge variant={
                        request.status === 'Fulfilled' ? 'success' : 
                        request.status === 'Pending' ? 'warning' : 
                        request.status === 'In Progress' ? 'brand' : 'gray'
                      }>
                        {request.status}
                      </Badge>
                    </td>
                    <td className="p-5 pr-6 text-right">
                      {request.status !== 'Fulfilled' && request.status !== 'Rejected' && request.status !== 'Cancelled' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleFulfillClick(request._id)}
                          isLoading={actionLoading === request._id}
                          className="shadow-sm"
                        >
                          Link Product
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!fulfillModal} onClose={() => setFulfillModal(null)} title="Link Product to Request">
        <div className="p-2 space-y-4">
          <p className="text-sm text-gray-600">
            Enter the exact Product ID you wish to link to this customer's request. This will instantly fulfill the request and notify the buyer.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5B4BFF] outline-none"
              placeholder="e.g. 64a8b...9f2"
              value={productIdInput}
              onChange={(e) => setProductIdInput(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => setFulfillModal(null)}>Cancel</Button>
            <Button onClick={submitFulfill} isLoading={actionLoading === fulfillModal}>Confirm Fulfillment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProductRequests;
