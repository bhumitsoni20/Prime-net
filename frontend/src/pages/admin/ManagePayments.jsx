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
  HiCheckCircle,
  HiXCircle,
  HiClipboardCopy,
  HiSparkles
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
      toast.success(`🔔 New wallet top-up proof: ₹${data.amount} from ${data.user?.name || 'Buyer'}`);
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
      toast.success('Order payment verified and access granted!');
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
      toast.success('Order payment marked as rejected.');
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

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 bg-white p-6 sm:p-8 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-[26px] sm:text-[28px] font-extrabold text-[#0F172A] tracking-[-0.03em]">
              Payment Verification Center
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#5B4BFF]/10 text-[#5B4BFF] border border-[#5B4BFF]/20">
              <HiSparkles className="w-3.5 h-3.5" /> UPI Verification
            </span>
          </div>
          <p className="text-[#64748B] text-[14.5px]">
            Audit incoming UPI payment receipts and top-ups with instant socket confirmation.
          </p>
        </div>

        {/* Section Tabs (Orders vs Wallet Topups) */}
        <div className="flex bg-[#F8FAFC] p-1.5 rounded-[16px] border border-[#E2E8F0] w-full lg:w-auto">
          <button
            onClick={() => {
              setSectionTab('orders');
              setPage(1);
            }}
            className={`flex-1 lg:flex-none px-5 py-2.5 rounded-[12px] text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
              sectionTab === 'orders'
                ? 'bg-[#5B4BFF] text-white shadow-sm shadow-[#5B4BFF]/30'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <HiShoppingBag className="w-4 h-4" /> Order Payments
          </button>
          <button
            onClick={() => {
              setSectionTab('topups');
              setPage(1);
            }}
            className={`flex-1 lg:flex-none px-5 py-2.5 rounded-[12px] text-[13px] font-bold transition-all flex items-center justify-center gap-2 relative ${
              sectionTab === 'topups'
                ? 'bg-[#5B4BFF] text-white shadow-sm shadow-[#5B4BFF]/30'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <HiCreditCard className="w-4 h-4" /> Wallet Top-Ups
            {topupStats.pendingCount > 0 && (
              <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-[#EF4444] text-white text-[10px] font-extrabold flex items-center justify-center">
                {topupStats.pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Status Filter Tabs */}
        <div className="p-4 sm:p-6 border-b border-[#F1F5F9] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#F8FAFC]/50">
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-[14px]">
            {[
              { id: 'pending_verification', label: 'Pending Review' },
              { id: 'payment_verified', label: 'Approved' },
              { id: 'payment_rejected', label: 'Rejected' },
              { id: 'all', label: 'All History' },
            ].map((status) => (
              <button
                key={status.id}
                onClick={() => {
                  setStatusFilter(status.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-[10px] text-[12.5px] font-bold transition-all ${
                  statusFilter === status.id
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>

          <div className="text-[12.5px] font-semibold text-[#64748B]">
            Showing {sectionTab === 'orders' ? orderVerifications.length : walletTopups.length} records
          </div>
        </div>

        {/* Orders Table */}
        {sectionTab === 'orders' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">
                  <th className="py-4 px-6 pl-7">Order / Product Info</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Amount (INR)</th>
                  <th className="py-4 px-6">Verification Status</th>
                  <th className="py-4 px-6 pr-7 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {isOrdersLoading ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center text-[#94A3B8] font-medium animate-pulse">
                      Loading verification queue...
                    </td>
                  </tr>
                ) : orderVerifications.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center text-[#64748B] text-sm bg-[#F8FAFC]/50">
                      No order payment proofs found matching this filter.
                    </td>
                  </tr>
                ) : (
                  orderVerifications.map((v) => (
                    <tr key={v._id} className="hover:bg-indigo-50/20 transition-colors group">
                      <td className="py-4 px-6 pl-7">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[12px] bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {v.product?.logo ? (
                              <img src={v.product.logo} alt={v.product.title} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[#5B4BFF] font-extrabold text-[14px]">
                                {v.product?.title?.[0] || '?'}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-[14.5px] font-bold text-[#0F172A] group-hover:text-[#5B4BFF] transition-colors">
                              {v.product?.title || 'Subscription Pass'}
                            </div>
                            <button
                              onClick={() => copyToClipboard(v.orderId, 'Order ID')}
                              className="text-[11.5px] text-[#64748B] font-mono hover:text-[#5B4BFF] flex items-center gap-1 mt-0.5"
                            >
                              <span>#{v.orderId?.substring(0, 12)}...</span>
                              <HiClipboardCopy className="w-3 h-3 text-[#94A3B8]" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-[14px] font-bold text-[#0F172A]">{v.buyer?.name || 'Customer'}</div>
                        <div className="text-[12px] text-[#64748B]">{v.buyer?.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-[16px] font-extrabold text-[#0F172A]">₹{v.amount?.toLocaleString()}</div>
                        <div className="text-[11px] text-[#64748B] font-medium">{new Date(v.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider border ${
                          v.status === 'payment_verified'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : v.status === 'payment_rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            v.status === 'payment_verified' ? 'bg-emerald-600' : v.status === 'payment_rejected' ? 'bg-rose-600' : 'bg-amber-600'
                          }`} />
                          {v.status === 'payment_verified' ? 'Approved' : v.status === 'payment_rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6 pr-7 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewScreenshot(v._id, false)}
                            disabled={isPreviewLoading && previewImage === 'loading'}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-[#5B4BFF] bg-indigo-50 hover:bg-indigo-100 rounded-[10px] border border-indigo-100 transition-colors"
                            title="View Screenshot Proof"
                          >
                            <HiOutlineEye className="w-4 h-4" /> View Proof
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
                                className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-[10px] border border-emerald-200 transition-colors"
                                title="Approve Payment"
                              >
                                <HiOutlineCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setRejectionModal({ isOpen: true, id: v._id, reason: '', type: 'order' })}
                                className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-[10px] border border-rose-200 transition-colors"
                                title="Reject Payment"
                              >
                                <HiOutlineX className="w-4 h-4" />
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
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">
                  <th className="py-4 px-6 pl-7">Customer</th>
                  <th className="py-4 px-6">Top-Up Amount</th>
                  <th className="py-4 px-6">UPI Ref / UTR</th>
                  <th className="py-4 px-6">Submitted At</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 pr-7 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {isTopupsLoading ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-[#94A3B8] font-medium animate-pulse">
                      Loading wallet top-up queue...
                    </td>
                  </tr>
                ) : walletTopups.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-[#64748B] text-sm bg-[#F8FAFC]/50">
                      No wallet top-up requests found.
                    </td>
                  </tr>
                ) : (
                  walletTopups.map((t) => (
                    <tr key={t._id} className="hover:bg-indigo-50/20 transition-colors group">
                      <td className="py-4 px-6 pl-7">
                        <div className="flex items-center gap-3">
                          <Avatar src={t.user?.avatar} name={t.user?.name} size="md" />
                          <div>
                            <div className="text-[14px] font-bold text-[#0F172A]">{t.user?.name || 'Customer'}</div>
                            <div className="text-[12px] text-[#64748B]">{t.user?.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-[16px] font-extrabold text-emerald-600">
                          +₹{t.amount?.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        {t.upiReference ? (
                          <button
                            onClick={() => copyToClipboard(t.upiReference, 'UPI UTR')}
                            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-[8px] text-[#0F172A] hover:border-indigo-200 transition-colors"
                          >
                            <span>{t.upiReference}</span>
                            <HiClipboardCopy className="w-3.5 h-3.5 text-[#94A3B8]" />
                          </button>
                        ) : (
                          <span className="text-xs text-[#94A3B8] italic">No reference provided</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-xs text-[#64748B] font-medium">
                        {new Date(t.createdAt).toLocaleString()}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider border ${
                          t.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : t.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            t.status === 'completed' ? 'bg-emerald-600' : t.status === 'rejected' ? 'bg-rose-600' : 'bg-amber-600'
                          }`} />
                          {t.status === 'completed' ? 'Credited' : t.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </td>

                      <td className="py-4 px-6 pr-7 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewScreenshot(t._id, true)}
                            disabled={isPreviewLoading && previewImage === 'loading'}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-[#5B4BFF] bg-indigo-50 hover:bg-indigo-100 rounded-[10px] border border-indigo-100 transition-colors"
                            title="View Top-Up Proof"
                          >
                            <HiOutlineEye className="w-4 h-4" /> View Proof
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
                                className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-[10px] border border-emerald-200 transition-colors"
                                title="Approve & Credit Balance"
                              >
                                <HiOutlineCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setRejectionModal({ isOpen: true, id: t._id, reason: '', type: 'topup' })}
                                className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-[10px] border border-rose-200 transition-colors"
                                title="Reject"
                              >
                                <HiOutlineX className="w-4 h-4" />
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

      {/* Screenshot Preview Lightbox Modal */}
      <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} title="Payment Screenshot Proof">
        <div className="mt-2">
          {previewImage === 'loading' ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
              <Spinner size="lg" className="mb-4" />
              <p className="font-semibold text-sm">Fetching verification image...</p>
            </div>
          ) : previewImage === 'FREE_ORDER' ? (
            <div className="text-center py-16 bg-[#F0FDF4] border border-[#BBF7D0] rounded-[16px] text-green-800">
              <HiShieldCheck className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <p className="text-[20px] font-extrabold">100% Free Order</p>
              <p className="text-sm mt-2 font-medium opacity-80">This transaction was completely covered by a promotional code.</p>
            </div>
          ) : previewImage ? (
            <div className="bg-slate-50 border border-slate-200 rounded-[16px] p-2 overflow-hidden flex justify-center">
              <img 
                src={previewImage} 
                alt="Payment Proof" 
                className="rounded-[12px] max-h-[70vh] object-contain shadow-sm" 
              />
            </div>
          ) : (
            <div className="text-center py-20 text-[#64748B]">No screenshot available</div>
          )}
        </div>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, id: null, reason: '', type: 'order' })}
        title={rejectionModal.type === 'topup' ? 'Reject Wallet Top-Up' : 'Reject Payment Proof'}
      >
        <form onSubmit={handleConfirmReject} className="space-y-6 mt-2">
          <div className="space-y-2">
            <label className="block text-[13px] font-bold text-[#0F172A]">Rejection Reason</label>
            <textarea
              placeholder="e.g. Transaction ID not found on bank statement, blurred receipt, or incorrect payment amount."
              value={rejectionModal.reason}
              onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
              required
              rows={4}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-3.5 text-[14px] text-[#0F172A] focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all placeholder:text-[#94A3B8]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setRejectionModal({ isOpen: false, id: null, reason: '', type: 'order' })}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
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
        title={approveModal.type === 'topup' ? 'Approve & Credit Wallet Top-Up' : 'Confirm Payment Approval'}
      >
        <div className="mt-2 space-y-6">
          <div className="p-4 rounded-[16px] bg-emerald-50 border border-emerald-200/80 text-emerald-900">
            <p className="text-[14.5px] leading-relaxed font-medium">
              {approveModal.type === 'topup'
                ? `You are confirming receipt of ₹${approveModal.amount} from ${approveModal.user}. This will immediately credit ₹${approveModal.amount} into their active wallet.`
                : `You are verifying payment of ₹${approveModal.amount}. The order credentials will be immediately delivered and buyer chat unlocked.`}
            </p>
          </div>

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
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
              onClick={handleConfirmApprove}
              loading={approveOrderMutation.isPending || approveTopupMutation.isPending}
            >
              Confirm & Approve
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManagePayments;
