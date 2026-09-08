import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiSearch,
  HiCheck,
  HiClipboardCopy,
  HiShieldCheck,
  HiCreditCard,
  HiCurrencyRupee,
  HiSparkles
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getAdminBuyerRefunds, approveBuyerRefund, rejectBuyerRefund } from '../../services/wallet.service';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const ManageBuyerRefunds = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedRefund, setSelectedRefund] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const [txnRef, setTxnRef] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  // Fetch Buyer Refunds
  const { data: refundsRes, isLoading } = useQuery({
    queryKey: ['adminBuyerRefunds', statusFilter, page],
    queryFn: async () => {
      const res = await getAdminBuyerRefunds({ status: statusFilter, page, limit: 15 });
      return res;
    },
    refetchInterval: 30000,
  });

  // Real-time socket listener for new refund requests
  useEffect(() => {
    if (!socket) return;

    const handleNewRefund = (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminBuyerRefunds'] });
      toast.success(`🔔 New 24-hr refund request: ₹${data.amount} from ${data.user?.name || 'Customer'}`);
    };

    socket.on('new_buyer_withdrawal', handleNewRefund);
    return () => {
      socket.off('new_buyer_withdrawal', handleNewRefund);
    };
  }, [socket, queryClient]);

  const refunds = refundsRes?.data || [];
  const pagination = refundsRes?.pagination || { page: 1, pages: 1, total: 0 };
  const stats = refundsRes?.stats || { pendingCount: 0, pendingTotal: 0, completedTotal: 0 };

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      return await approveBuyerRefund(id, payload);
    },
    onSuccess: () => {
      toast.success('Refund marked as paid and completed successfully!');
      setApproveModalOpen(false);
      setSelectedRefund(null);
      setTxnRef('');
      setAdminNote('');
      queryClient.invalidateQueries({ queryKey: ['adminBuyerRefunds'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to approve refund.');
    },
  });

  // Reject Mutation (Restores funds to customer)
  const rejectMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      return await rejectBuyerRefund(id, payload);
    },
    onSuccess: () => {
      toast.success('Refund rejected and balance safely restored to customer wallet.');
      setRejectModalOpen(false);
      setSelectedRefund(null);
      setRejectReason('');
      setAdminNote('');
      queryClient.invalidateQueries({ queryKey: ['adminBuyerRefunds'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to reject refund.');
    },
  });

  const handleCopyUpi = (upiId) => {
    navigator.clipboard.writeText(upiId);
    toast.success(`Copied "${upiId}" to clipboard!`);
  };

  const handleOpenApprove = (refund) => {
    setSelectedRefund(refund);
    setTxnRef('');
    setAdminNote('');
    setApproveModalOpen(true);
  };

  const handleOpenReject = (refund) => {
    setSelectedRefund(refund);
    setRejectReason('');
    setAdminNote('');
    setRejectModalOpen(true);
  };

  const handleConfirmApprove = (e) => {
    e.preventDefault();
    if (!selectedRefund) return;
    approveMutation.mutate({
      id: selectedRefund._id,
      payload: { transactionReference: txnRef, adminNote },
    });
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!selectedRefund) return;
    if (!rejectReason.trim()) {
      return toast.error('Please provide a rejection reason');
    }
    rejectMutation.mutate({
      id: selectedRefund._id,
      payload: { rejectionReason: rejectReason.trim(), adminNote },
    });
  };

  // Filter by local search query
  const filteredRefunds = refunds.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.user?.name?.toLowerCase().includes(q) ||
      r.user?.email?.toLowerCase().includes(q) ||
      r.upiId?.toLowerCase().includes(q) ||
      r._id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-[26px] sm:text-[28px] font-extrabold text-[#0F172A] tracking-[-0.03em]">
              Customer Refunds & Escrow Returns
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#5B4BFF]/10 text-[#5B4BFF] border border-[#5B4BFF]/20">
              <HiSparkles className="w-3.5 h-3.5" /> 24h SLA
            </span>
          </div>
          <p className="text-[#64748B] text-[14.5px]">
            Process buyer refund claims back to source UPI handles within the 24-hour guarantee window.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-[22px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(217,119,6,0.08)] transition-all flex items-center justify-between">
          <div>
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Pending Claims
            </span>
            <div className="text-[28px] font-extrabold text-amber-600">{stats.pendingCount}</div>
            <p className="text-[12px] text-[#94A3B8] font-medium mt-1">Requiring immediate fulfillment</p>
          </div>
          <div className="w-12 h-12 rounded-[14px] bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-sm">
            <HiClock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-6 rounded-[22px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(91,75,255,0.08)] transition-all flex items-center justify-between">
          <div>
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Pending Volume
            </span>
            <div className="text-[28px] font-extrabold text-[#0F172A]">₹{stats.pendingTotal.toLocaleString()}</div>
            <p className="text-[12px] text-[#94A3B8] font-medium mt-1">Held in refund escrow buffer</p>
          </div>
          <div className="w-12 h-12 rounded-[14px] bg-indigo-50 border border-indigo-200 text-[#5B4BFF] flex items-center justify-center shadow-sm">
            <HiCreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-6 rounded-[22px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(22,163,74,0.08)] transition-all flex items-center justify-between">
          <div>
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Total Refunded
            </span>
            <div className="text-[28px] font-extrabold text-emerald-600">₹{stats.completedTotal.toLocaleString()}</div>
            <p className="text-[12px] text-[#94A3B8] font-medium mt-1">Successfully settled to buyers</p>
          </div>
          <div className="w-12 h-12 rounded-[14px] bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-sm">
            <HiCheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Filter & Search Toolbar */}
        <div className="p-4 sm:p-6 border-b border-[#F1F5F9] flex flex-col md:flex-row items-center justify-between gap-4 bg-[#F8FAFC]/50">
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-[14px] w-full md:w-auto">
            {[
              { id: 'pending', label: 'Pending SLA' },
              { id: 'completed', label: 'Refunded' },
              { id: 'rejected', label: 'Rejected' },
              { id: 'all', label: 'All History' },
            ].map((status) => (
              <button
                key={status.id}
                onClick={() => {
                  setStatusFilter(status.id);
                  setPage(1);
                }}
                className={`flex-1 md:flex-initial px-4 py-1.5 rounded-[10px] text-[12.5px] font-bold transition-all ${
                  statusFilter === status.id ? 'bg-white text-[#0F172A] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search customer, email or UPI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-[12px] text-[13.5px] font-medium text-[#0F172A] focus:border-[#5B4BFF] focus:ring-4 focus:ring-[#5B4BFF]/10 outline-none transition-all placeholder:text-[#94A3B8]"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">
                <th className="py-4 px-6 pl-7">Customer Info</th>
                <th className="py-4 px-6">Refund Amount</th>
                <th className="py-4 px-6">Destination UPI VPA</th>
                <th className="py-4 px-6">Requested / SLA Status</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 pr-7 text-right">Settlement Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-[#94A3B8] font-medium animate-pulse">
                    Loading refund queue...
                  </td>
                </tr>
              ) : filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-[#64748B] text-sm bg-[#F8FAFC]/50">
                    No customer refund requests found under "{statusFilter}".
                  </td>
                </tr>
              ) : (
                filteredRefunds.map((refund) => {
                  const hoursElapsed = dayjs().diff(dayjs(refund.createdAt), 'hour');
                  const isUrgent = hoursElapsed >= 18 && refund.status === 'pending';

                  return (
                    <tr key={refund._id} className="hover:bg-indigo-50/20 transition-colors group">
                      <td className="py-4 px-6 pl-7">
                        <div className="flex items-center gap-3">
                          <Avatar src={refund.user?.avatar} name={refund.user?.name} size="md" />
                          <div>
                            <div className="text-[14.5px] font-bold text-[#0F172A] group-hover:text-[#5B4BFF] transition-colors">
                              {refund.user?.name || 'Customer'}
                            </div>
                            <div className="text-[12px] text-[#64748B]">{refund.user?.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-[16px] font-extrabold text-[#0F172A]">
                          ₹{refund.amount?.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyUpi(refund.upiId)}
                            className="inline-flex items-center gap-1.5 text-[12.5px] font-mono font-bold text-[#5B4BFF] bg-indigo-50/80 border border-indigo-100 hover:border-indigo-300 px-2.5 py-1 rounded-[8px] transition-colors"
                          >
                            <span>{refund.upiId}</span>
                            <HiClipboardCopy className="w-3.5 h-3.5 text-[#5B4BFF]" />
                          </button>
                        </div>
                        {refund.beneficiaryName && (
                          <span className="text-[11px] text-[#94A3B8] font-medium block mt-0.5">
                            Beneficiary: {refund.beneficiaryName}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="text-[12.5px] font-bold text-[#0F172A]">
                          {dayjs(refund.createdAt).format('MMM D, YYYY • h:mm A')}
                        </div>
                        {refund.status === 'pending' && (
                          <span
                            className={`text-[11px] font-bold inline-flex items-center gap-1 mt-0.5 ${
                              isUrgent ? 'text-rose-600' : 'text-amber-600'
                            }`}
                          >
                            <HiClock className="w-3.5 h-3.5" />
                            {hoursElapsed}h ago ({24 - hoursElapsed > 0 ? `${24 - hoursElapsed}h SLA left` : 'SLA Overdue'})
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider border ${
                          refund.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : refund.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            refund.status === 'completed' ? 'bg-emerald-600' : refund.status === 'rejected' ? 'bg-rose-600' : 'bg-amber-600'
                          }`} />
                          {refund.status === 'completed' ? 'Refunded' : refund.status === 'rejected' ? 'Restored' : 'Pending'}
                        </span>
                      </td>

                      <td className="py-4 px-6 pr-7 text-right">
                        {refund.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 shadow-sm shadow-emerald-600/20"
                              onClick={() => handleOpenApprove(refund)}
                            >
                              <HiCheck className="w-4 h-4 mr-1" /> Mark Paid
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              className="px-3 font-bold"
                              onClick={() => handleOpenReject(refund)}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[12px] text-[#94A3B8] font-medium bg-[#F1F5F9] px-2.5 py-1 rounded-[8px]">
                            {refund.status === 'completed' ? `UTR: ${refund.transactionReference || 'N/A'}` : 'Restored to Wallet'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-[#E2E8F0] flex justify-center bg-[#F8FAFC]">
            <Pagination
              currentPage={page}
              totalPages={pagination.pages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <Modal isOpen={approveModalOpen} onClose={() => setApproveModalOpen(false)} title="Confirm UPI Refund Transfer">
        <form onSubmit={handleConfirmApprove} className="space-y-5 mt-2">
          <div className="p-4 rounded-[16px] bg-indigo-50/50 border border-indigo-100 space-y-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#64748B] font-bold">Customer Name</span>
              <span className="text-[#0F172A] font-bold">{selectedRefund?.user?.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#64748B] font-bold">Refund Amount</span>
              <span className="text-emerald-600 font-extrabold text-[15px]">₹{selectedRefund?.amount}</span>
            </div>
            <div className="flex justify-between text-xs items-center">
              <span className="text-[#64748B] font-bold">Destination UPI</span>
              <code className="bg-white px-2.5 py-1 rounded-[8px] border border-indigo-200 text-[#5B4BFF] font-bold font-mono">
                {selectedRefund?.upiId}
              </code>
            </div>
          </div>

          <Input
            label="Transaction Reference / UTR Number"
            placeholder="e.g. 423891002341"
            value={txnRef}
            onChange={(e) => setTxnRef(e.target.value)}
          />

          <Input
            label="Admin Settlement Note (Optional)"
            placeholder="e.g. Processed via HDFC Business UPI"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={approveMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20">
              Confirm Refund Paid
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Refund Request">
        <form onSubmit={handleConfirmReject} className="space-y-5 mt-2">
          <div className="p-4 rounded-[16px] bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold leading-relaxed">
            ⚠️ Rejecting this request will <strong>immediately restore ₹{selectedRefund?.amount}</strong> back into the customer's wallet balance.
          </div>

          <Input
            label="Rejection Reason (Required)"
            placeholder="e.g. Invalid UPI ID / Account not accepting payments"
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />

          <Input
            label="Internal Note (Optional)"
            placeholder="Additional notes for record"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={rejectMutation.isPending} className="font-bold">
              Reject & Restore Funds
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageBuyerRefunds;
