import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiOutlineEye, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const ManagePayments = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending_verification');
  
  const [previewImage, setPreviewImage] = useState(null);
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, id: null, reason: '' });
  const [approveModal, setApproveModal] = useState({ isOpen: false, id: null });

  const { data, isLoading } = useQuery({
    queryKey: ['adminPayments', page, statusFilter],
    queryFn: async () => {
      const res = await api.get('/payment-verifications', {
        params: { page, limit: 10, status: statusFilter !== 'all' ? statusFilter : undefined }
      });
      return res.data;
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (id) => await api.post(`/payment-verifications/${id}/approve`),
    onSuccess: () => {
      toast.success('Payment approved successfully');
      queryClient.invalidateQueries(['adminPayments']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to approve payment');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, rejectionReason }) => await api.post(`/payment-verifications/${id}/reject`, { rejectionReason }),
    onSuccess: () => {
      toast.success('Payment rejected successfully');
      queryClient.invalidateQueries(['adminPayments']);
      setRejectionModal({ isOpen: false, id: null, reason: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to reject payment');
    }
  });

  const handleApproveClick = (id) => {
    setApproveModal({ isOpen: true, id });
  };

  const confirmApprove = () => {
    approveMutation.mutate(approveModal.id);
    setApproveModal({ isOpen: false, id: null });
  };

  const handleReject = (e) => {
    e.preventDefault();
    if (!rejectionModal.reason.trim()) {
      return toast.error('Rejection reason is required');
    }
    rejectMutation.mutate({ id: rejectionModal.id, rejectionReason: rejectionModal.reason });
  };

  const verifications = data?.verifications || [];
  const pagination = data?.pagination || { page: 1, pages: 1 };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em] mb-1">Payment Verification</h1>
          <p className="text-[#64748B] text-[15px]">Review and approve manual UPI payments.</p>
        </div>
        
        <div className="flex bg-[#F1F5F9] p-1 rounded-xl">
          {['all', 'pending_verification', 'payment_verified', 'payment_rejected'].map(status => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${statusFilter === status ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
            >
              {status.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-[24px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="py-4 px-6 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Order / Product</th>
                <th className="py-4 px-6 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Buyer</th>
                <th className="py-4 px-6 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Amount</th>
                <th className="py-4 px-6 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-[#64748B] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <Spinner size="lg" className="mx-auto" />
                  </td>
                </tr>
              ) : verifications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-[#64748B]">
                    No payment verifications found.
                  </td>
                </tr>
              ) : (
                verifications.map((v) => (
                  <tr key={v._id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center overflow-hidden">
                          {v.product?.logo ? (
                            <img src={v.product.logo} alt={v.product.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[#94A3B8] font-bold">{v.product?.title?.[0] || '?'}</span>
                          )}
                        </div>
                        <div>
                          <div className="text-[14px] font-bold text-[#0F172A]">{v.product?.title || 'Unknown Product'}</div>
                          <div className="text-[12px] text-[#64748B] font-mono">{v.orderId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-[14px] font-bold text-[#0F172A]">{v.buyer?.name}</div>
                      <div className="text-[13px] text-[#64748B]">{v.buyer?.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-[15px] font-extrabold text-[#0F172A]">₹{v.amount?.toLocaleString()}</div>
                      <div className="text-[12px] text-[#64748B]">{new Date(v.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="py-4 px-6">
                      {v.status === 'pending_verification' && <Badge variant="warning">Pending</Badge>}
                      {v.status === 'payment_verified' && <Badge variant="success">Verified</Badge>}
                      {v.status === 'payment_rejected' && <Badge variant="error">Rejected</Badge>}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setPreviewImage(v.paymentScreenshot)}
                          className="p-2 text-[#5B4BFF] bg-[#5B4BFF]/10 hover:bg-[#5B4BFF]/20 rounded-lg transition-colors"
                          title="View Screenshot"
                        >
                          <HiOutlineEye className="w-5 h-5" />
                        </button>
                        
                        {v.status === 'pending_verification' && (
                          <>
                            <button 
                              onClick={() => handleApproveClick(v._id)}
                              disabled={approveMutation.isPending}
                              className="p-2 text-[#10B981] bg-[#10B981]/10 hover:bg-[#10B981]/20 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <HiOutlineCheck className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => setRejectionModal({ isOpen: true, id: v._id, reason: '' })}
                              className="p-2 text-[#EF4444] bg-[#EF4444]/10 hover:bg-[#EF4444]/20 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <HiOutlineX className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="text-[13px] font-bold text-[#64748B]">
              Page {page} of {pagination.pages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page === pagination.pages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} title="Payment Screenshot">
        <div className="mt-4">
          <img src={previewImage} alt="Payment Proof" className="w-full rounded-xl" />
        </div>
      </Modal>

      {/* Rejection Modal */}
      <Modal isOpen={rejectionModal.isOpen} onClose={() => setRejectionModal({ isOpen: false, id: null, reason: '' })} title="Reject Payment">
        <form onSubmit={handleReject} className="space-y-6 mt-4">
          <Input 
            label="Rejection Reason"
            placeholder="e.g. Invalid screenshot, incorrect amount..."
            value={rejectionModal.reason}
            onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setRejectionModal({ isOpen: false, id: null, reason: '' })}>Cancel</Button>
            <Button type="submit" variant="danger" loading={rejectMutation.isPending}>Reject Payment</Button>
          </div>
        </form>
      </Modal>

      {/* Approve Modal */}
      <Modal isOpen={approveModal.isOpen} onClose={() => setApproveModal({ isOpen: false, id: null })} title="Approve Payment">
        <div className="mt-4 space-y-6">
          <p className="text-[#334155] text-[15px] leading-relaxed">
            Are you sure you want to approve this payment? This will unlock the chat and credentials for the buyer.
          </p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setApproveModal({ isOpen: false, id: null })}>Cancel</Button>
            <Button type="button" onClick={confirmApprove} loading={approveMutation.isPending}>Approve</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default ManagePayments;
