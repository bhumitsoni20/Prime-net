import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HiOutlineEye,
  HiOutlineCheck,
  HiOutlineX,
  HiShieldCheck,
  HiCreditCard,
  HiShoppingBag,
  HiClock,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import {
  getAdminWalletTopups,
  getAdminWalletTopupById,
  approveWalletTopup,
  rejectWalletTopup,
} from '../../services/wallet.service';
import { useSocket } from '../../context/SocketContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';

const ManagePayments = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const [sectionTab, setSectionTab] = useState('orders'); // 'orders' | 'topups'
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending_verification');

  const [previewImage, setPreviewImage] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, id: null, reason: '', type: 'order' });
  const [approveModal, setApproveModal] = useState({ isOpen: false, id: null, type: 'order', amount: 0, user: '' });

  // Socket listener for new top-ups and payments
  useEffect(() => {
    if (!socket) return;

    const handleNewTopup = (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminWalletTopups'] });
      toast(`🔔 New wallet top-up proof: ₹${data.amount} from ${data.user?.name || 'Buyer'}`);
    };

    socket.on('new_wallet_topup', handleNewTopup);
    return () => {
      socket.off('new_wallet_topup', handleNewTopup);
    };
  }, [socket, queryClient]);

  // Query: Order Payment Verifications
  const { data: orderPaymentsData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['adminPayments', page, statusFilter],
    queryFn: async () => {
      const res = await api.get('/payment-verifications', {
        params: { page, limit: 10, status: statusFilter !== 'all' ? statusFilter : undefined },
      });
      return res.data;
    },
    enabled: sectionTab === 'orders',
  });

  // Query: Wallet Top-Up Verifications
  const { data: walletTopupsData, isLoading: isTopupsLoading } = useQuery({
    queryKey: ['adminWalletTopups', page, statusFilter],
    queryFn: async () => {
      const res = await getAdminWalletTopups({
        page,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      return res;
    },
    enabled: sectionTab === 'topups',
  });

  // Order Approval Mutation
  const approveOrderMutation = useMutation({
    mutationFn: async (id) => await api.post(`/payment-verifications/${id}/approve`),
    onSuccess: () => {
      toast.success('Order payment approved successfully');
      queryClient.invalidateQueries({ queryKey: ['adminPayments'] });
      setApproveModal({ isOpen: false, id: null, type: 'order', amount: 0, user: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to approve payment');
    },
  });

  // Order Rejection Mutation
  const rejectOrderMutation = useMutation({
    mutationFn: async ({ id, rejectionReason }) =>
      await api.post(`/payment-verifications/${id}/reject`, { rejectionReason }),
    onSuccess: () => {
      toast.success('Order payment rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['adminPayments'] });
      setRejectionModal({ isOpen: false, id: null, reason: '', type: 'order' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to reject payment');
    },
  });

  // Wallet Top-Up Approval Mutation
  const approveTopupMutation = useMutation({
    mutationFn: async (id) => await approveWalletTopup(id),
    onSuccess: () => {
      toast.success('Wallet top-up approved & balance credited to customer!');
      queryClient.invalidateQueries({ queryKey: ['adminWalletTopups'] });
      setApproveModal({ isOpen: false, id: null, type: 'topup', amount: 0, user: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to approve wallet topup');
    },
  });

  // Wallet Top-Up Rejection Mutation
  const rejectTopupMutation = useMutation({
    mutationFn: async ({ id, rejectionReason }) => await rejectWalletTopup(id, rejectionReason),
    onSuccess: () => {
      toast.success('Wallet top-up rejected.');
      queryClient.invalidateQueries({ queryKey: ['adminWalletTopups'] });
      setRejectionModal({ isOpen: false, id: null, reason: '', type: 'topup' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to reject wallet topup');
    },
  });

  const handleViewScreenshot = async (id, isTopup = false) => {
    setIsPreviewLoading(true);
    setPreviewImage('loading');
    try {
      if (isTopup) {
        const res = await getAdminWalletTopupById(id);
        setPreviewImage(res.data?.paymentScreenshot || null);
      } else {
        const res = await api.get(`/payment-verifications/${id}`);
        setPreviewImage(res.data?.paymentScreenshot || null);
      }
    } catch (err) {
      toast.error('Failed to load screenshot');
      setPreviewImage(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleConfirmApprove = () => {
    if (approveModal.type === 'topup') {
      approveTopupMutation.mutate(approveModal.id);
    } else {
      approveOrderMutation.mutate(approveModal.id);
    }
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectionModal.reason.trim()) {
      return toast.error('Rejection reason is required');
    }
    if (rejectionModal.type === 'topup') {
      rejectTopupMutation.mutate({ id: rejectionModal.id, rejectionReason: rejectionModal.reason });
    } else {
      rejectOrderMutation.mutate({ id: rejectionModal.id, rejectionReason: rejectionModal.reason });
    }
  };

  const orderVerifications = orderPaymentsData?.verifications || [];
  const walletTopups = walletTopupsData?.data || [];
  const topupStats = walletTopupsData?.stats || { pendingCount: 0 };
  const pagination =
    sectionTab === 'orders'
      ? orderPaymentsData?.pagination || { page: 1, pages: 1 }
      : walletTopupsData?.pagination || { page: 1, pages: 1 };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em] mb-1">
            Payment Verification Portal
          </h1>
          <p className="text-[#64748B] text-[15px]">Review and approve manual UPI payments and wallet top-ups.</p>
        </div>

        {/* Section Tabs (Orders vs Wallet Topups) */}
        <div className="flex bg-[#EEF2FF] p-1.5 rounded-[16px] border border-[#C7D2FE]/60">
          <button
            onClick={() => {
              setSectionTab('orders');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              sectionTab === 'orders'
                ? 'bg-white text-[#5B4BFF] shadow-sm'
                : 'text-[#4338CA] hover:text-[#1E1B4B]'
            }`}
          >
            <HiShoppingBag className="w-4 h-4" /> Order Payments
          </button>
          <button
            onClick={() => {
              setSectionTab('topups');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 relative ${
              sectionTab === 'topups'
                ? 'bg-white text-[#5B4BFF] shadow-sm'
                : 'text-[#4338CA] hover:text-[#1E1B4B]'
            }`}
          >
            <HiCreditCard className="w-4 h-4" /> Wallet Top-Ups (₹30-₹1k)
            {topupStats.pendingCount > 0 && (
              <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-[#EF4444] text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                {topupStats.pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] shadow-sm overflow-hidden">
        {/* Status Filter Tabs */}
        <div className="p-4 sm:p-6 border-b border-[#F1F5F9] flex justify-between items-center">
          <div className="flex bg-[#F1F5F9] p-1 rounded-xl">
            {['all', 'pending_verification', 'payment_verified', 'payment_rejected'].map((status) => {
              const label =
                status === 'all'
                  ? 'ALL'
                  : status === 'pending_verification'
                  ? 'PENDING'
                  : status === 'payment_verified'
                  ? 'APPROVED'
                  : 'REJECTED';
              return (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === status
                      ? 'bg-white text-[#0F172A] shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders Table */}
        {sectionTab === 'orders' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="py-4 px-6 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Order / Product</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Buyer</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Amount</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {isOrdersLoading ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center">
                      <Spinner size="lg" className="mx-auto" />
                    </td>
                  </tr>
                ) : orderVerifications.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-[#64748B] text-sm">
                      No order payment verifications found.
                    </td>
                  </tr>
                ) : (
                  orderVerifications.map((v) => (
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
                        <div className="text-[12px] text-[#64748B]">{v.buyer?.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-[15px] font-extrabold text-[#0F172A]">₹{v.amount?.toLocaleString()}</div>
                        <div className="text-[11px] text-[#64748B]">{new Date(v.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="py-4 px-6">
                        {v.status === 'pending_verification' && <Badge variant="warning">Pending</Badge>}
                        {v.status === 'payment_verified' && <Badge variant="success">Verified</Badge>}
                        {v.status === 'payment_rejected' && <Badge variant="error">Rejected</Badge>}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewScreenshot(v._id, false)}
                            disabled={isPreviewLoading && previewImage === 'loading'}
                            className="p-2 text-[#5B4BFF] bg-[#5B4BFF]/10 hover:bg-[#5B4BFF]/20 rounded-lg transition-colors"
                            title="View Screenshot"
                          >
                            <HiOutlineEye className="w-5 h-5" />
                          </button>

                          {v.status === 'pending_verification' && (
                            <>
                              <button
                                onClick={() =>
                                  setApproveModal({
                                    isOpen: true,
                                    id: v._id,
                                    type: 'order',
                                    amount: v.amount,
                                    user: v.buyer?.name,
                                  })
                                }
                                disabled={approveOrderMutation.isPending}
                                className="p-2 text-[#10B981] bg-[#10B981]/10 hover:bg-[#10B981]/20 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <HiOutlineCheck className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setRejectionModal({ isOpen: true, id: v._id, reason: '', type: 'order' })}
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
        ) : (
          /* Wallet Top-Ups Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="py-4 px-6 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Customer</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Top-Up Amount</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">UPI Ref / UTR</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Submitted</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {isTopupsLoading ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <Spinner size="lg" className="mx-auto" />
                    </td>
                  </tr>
                ) : walletTopups.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-[#64748B] text-sm">
                      No wallet top-up requests found.
                    </td>
                  </tr>
                ) : (
                  walletTopups.map((t) => (
                    <tr key={t._id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar src={t.user?.avatar} name={t.user?.name} size="md" />
                          <div>
                            <div className="text-[14px] font-bold text-[#0F172A]">{t.user?.name || 'Customer'}</div>
                            <div className="text-[12px] text-[#64748B]">{t.user?.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-[16px] font-extrabold text-[#16A34A]">
                          +₹{t.amount?.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        {t.upiReference ? (
                          <code className="text-xs font-mono font-bold bg-[#F1F5F9] px-2 py-1 rounded text-[#0F172A]">
                            {t.upiReference}
                          </code>
                        ) : (
                          <span className="text-xs text-[#94A3B8] italic">No reference provided</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-xs text-[#64748B] font-medium">
                        {new Date(t.createdAt).toLocaleString()}
                      </td>

                      <td className="py-4 px-6">
                        {t.status === 'pending_verification' && <Badge variant="warning">Pending</Badge>}
                        {t.status === 'completed' && <Badge variant="success">Credited</Badge>}
                        {t.status === 'rejected' && <Badge variant="error">Rejected</Badge>}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewScreenshot(t._id, true)}
                            disabled={isPreviewLoading && previewImage === 'loading'}
                            className="p-2 text-[#5B4BFF] bg-[#5B4BFF]/10 hover:bg-[#5B4BFF]/20 rounded-lg transition-colors"
                            title="View Top-Up Proof"
                          >
                            <HiOutlineEye className="w-5 h-5" />
                          </button>

                          {t.status === 'pending_verification' && (
                            <>
                              <button
                                onClick={() =>
                                  setApproveModal({
                                    isOpen: true,
                                    id: t._id,
                                    type: 'topup',
                                    amount: t.amount,
                                    user: t.user?.name,
                                  })
                                }
                                disabled={approveTopupMutation.isPending}
                                className="p-2 text-[#10B981] bg-[#10B981]/10 hover:bg-[#10B981]/20 rounded-lg transition-colors"
                                title="Approve & Credit Balance"
                              >
                                <HiOutlineCheck className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setRejectionModal({ isOpen: true, id: t._id, reason: '', type: 'topup' })}
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
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-[13px] font-bold text-[#64748B]">
              Page {page} of {pagination.pages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page === pagination.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Screenshot Preview Modal */}
      <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} title="Payment Screenshot Proof">
        <div className="mt-4">
          {previewImage === 'loading' ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
              <Spinner size="lg" className="mb-4" />
              <p>Loading screenshot...</p>
            </div>
          ) : previewImage === 'FREE_ORDER' ? (
            <div className="text-center py-16 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-green-800">
              <HiShieldCheck className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <p className="text-[20px] font-bold">100% Free Order</p>
              <p className="text-sm mt-2 font-medium opacity-80">This order was completely covered by a coupon.</p>
            </div>
          ) : previewImage ? (
            <img src={previewImage} alt="Payment Proof" className="w-full rounded-xl max-h-[70vh] object-contain bg-black/5" />
          ) : (
            <div className="text-center py-20 text-[#64748B]">No screenshot available</div>
          )}
        </div>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, id: null, reason: '', type: 'order' })}
        title={rejectionModal.type === 'topup' ? 'Reject Wallet Top-Up' : 'Reject Payment'}
      >
        <form onSubmit={handleConfirmReject} className="space-y-6 mt-4">
          <Input
            label="Rejection Reason"
            placeholder="e.g. Invalid screenshot, incorrect amount or missing UTR"
            value={rejectionModal.reason}
            onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setRejectionModal({ isOpen: false, id: null, reason: '', type: 'order' })}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              loading={rejectOrderMutation.isPending || rejectTopupMutation.isPending}
            >
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={approveModal.isOpen}
        onClose={() => setApproveModal({ isOpen: false, id: null, type: 'order', amount: 0, user: '' })}
        title={approveModal.type === 'topup' ? 'Approve & Credit Wallet Top-Up' : 'Approve Payment'}
      >
        <div className="mt-4 space-y-6">
          <p className="text-[#334155] text-[15px] leading-relaxed">
            {approveModal.type === 'topup'
              ? `Are you sure you want to approve ₹${approveModal.amount} for ${approveModal.user}? This will immediately credit ₹${approveModal.amount} to the customer's wallet balance.`
              : 'Are you sure you want to approve this order payment? This will unlock the order chat and credentials for the buyer.'}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setApproveModal({ isOpen: false, id: null, type: 'order', amount: 0, user: '' })}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmApprove}
              loading={approveOrderMutation.isPending || approveTopupMutation.isPending}
            >
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManagePayments;
