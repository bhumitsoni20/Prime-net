import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiSearch,
  HiCheck,
  HiClipboardCopy,
  HiOutlineDocumentDuplicate,
  HiShieldCheck,
  HiCreditCard,
  HiCurrencyRupee,
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
  const { data: refundsRes, isLoading, refetch } = useQuery({
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
      toast(`🔔 New 24-hr refund request: ₹${data.amount} from ${data.user?.name || 'Customer'}`);
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
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em]">
            Customer Refunds & Withdrawals
          </h1>
          <p className="text-[#64748B] text-[15px] mt-0.5">
            Process buyer wallet refund requests to UPI within the 24-hour SLA window.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-[24px] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Pending Requests
            </span>
            <div className="text-[28px] font-extrabold text-[#D97706]">{stats.pendingCount}</div>
            <p className="text-xs text-[#94A3B8] font-medium mt-1">Requiring 24-hr fulfillment</p>
          </div>
          <div className="w-12 h-12 rounded-[16px] bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
            <HiClock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-6 rounded-[24px] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Pending Amount
            </span>
            <div className="text-[28px] font-extrabold text-[#0F172A]">₹{stats.pendingTotal.toLocaleString()}</div>
            <p className="text-xs text-[#94A3B8] font-medium mt-1">Held in refund escrow</p>
          </div>
          <div className="w-12 h-12 rounded-[16px] bg-[#EEF2FF] text-[#5B4BFF] flex items-center justify-center">
            <HiCreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-6 rounded-[24px] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Total Refunded
            </span>
            <div className="text-[28px] font-extrabold text-[#16A34A]">₹{stats.completedTotal.toLocaleString()}</div>
            <p className="text-xs text-[#94A3B8] font-medium mt-1">Successfully sent to customers</p>
          </div>
          <div className="w-12 h-12 rounded-[16px] bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
            <HiCheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] shadow-sm overflow-hidden">
        {/* Filter & Search Toolbar */}
        <div className="p-6 border-b border-[#F1F5F9] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex bg-[#F1F5F9] p-1 rounded-xl w-full md:w-auto">
            {['pending', 'completed', 'rejected', 'all'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`flex-1 md:flex-initial px-5 py-2 rounded-lg text-[13px] font-bold transition-all ${
                  statusFilter === status ? 'bg-white text-[#0F172A] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {status.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search customer or UPI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0F172A] focus:bg-white focus:border-[#5B4BFF] outline-none transition-all"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="py-4 px-6 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Customer</th>
                <th className="py-4 px-6 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Amount</th>
                <th className="py-4 px-6 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Customer UPI ID</th>
                <th className="py-4 px-6 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Requested / SLA</th>
                <th className="py-4 px-6 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <Spinner size="lg" className="mx-auto" />
                  </td>
                </tr>
              ) : filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-[#64748B] text-sm">
                    No customer refund requests found under "{statusFilter}".
                  </td>
                </tr>
              ) : (
                filteredRefunds.map((refund) => {
                  const hoursElapsed = dayjs().diff(dayjs(refund.createdAt), 'hour');
                  const isUrgent = hoursElapsed >= 18 && refund.status === 'pending';

                  return (
                    <tr key={refund._id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar src={refund.user?.avatar} name={refund.user?.name} size="md" />
                          <div>
                            <div className="text-[14px] font-bold text-[#0F172A]">{refund.user?.name || 'Customer'}</div>
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
                          <code className="text-[13px] font-bold text-[#5B4BFF] bg-[#EEF2FF] px-2.5 py-1 rounded-md">
                            {refund.upiId}
                          </code>
                          <button
                            onClick={() => handleCopyUpi(refund.upiId)}
                            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded-md transition-colors"
                            title="Copy UPI ID"
                          >
                            <HiOutlineDocumentDuplicate className="w-4 h-4" />
                          </button>
                        </div>
                        {refund.beneficiaryName && (
                          <span className="text-[11px] text-[#94A3B8] font-medium block mt-0.5">
                            Name: {refund.beneficiaryName}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="text-[12px] font-bold text-[#0F172A]">
                          {dayjs(refund.createdAt).format('MMM D, YYYY • h:mm A')}
                        </div>
                        {refund.status === 'pending' && (
                          <span
                            className={`text-[11px] font-bold inline-flex items-center gap-1 mt-0.5 ${
                              isUrgent ? 'text-[#EF4444]' : 'text-[#D97706]'
                            }`}
                          >
                            <HiClock className="w-3.5 h-3.5" />
                            {hoursElapsed}h ago ({24 - hoursElapsed > 0 ? `${24 - hoursElapsed}h SLA remaining` : 'SLA Overdue'})
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {refund.status === 'pending' && <Badge variant="warning">Pending (24h SLA)</Badge>}
                        {refund.status === 'completed' && <Badge variant="success">Refunded</Badge>}
                        {refund.status === 'rejected' && <Badge variant="error">Rejected & Restored</Badge>}
                      </td>

                      <td className="py-4 px-6 text-right">
                        {refund.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-[#10B981] hover:bg-[#059669] text-white px-3.5"
                              onClick={() => handleOpenApprove(refund)}
                            >
                              <HiCheck className="w-4 h-4 mr-1" /> Mark Paid
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              className="px-3"
                              onClick={() => handleOpenReject(refund)}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-[#94A3B8] font-medium">
                            {refund.status === 'completed' ? `Ref: ${refund.transactionReference || 'N/A'}` : 'Restored to Wallet'}
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
          <div className="p-4 border-t border-[#E2E8F0] flex justify-center">
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
        <form onSubmit={handleConfirmApprove} className="space-y-5 mt-4">
          <div className="p-4 rounded-[16px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#64748B] font-bold">Customer</span>
              <span className="text-[#0F172A] font-bold">{selectedRefund?.user?.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#64748B] font-bold">Refund Amount</span>
              <span className="text-[#10B981] font-extrabold text-[15px]">₹{selectedRefund?.amount}</span>
            </div>
            <div className="flex justify-between text-xs items-center">
              <span className="text-[#64748B] font-bold">Destination UPI</span>
              <code className="bg-white px-2 py-0.5 rounded border border-[#CBD5E1] text-[#5B4BFF] font-bold">
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
            label="Admin Note (Optional)"
            placeholder="Payment completed via GPay / PhonePe"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={approveMutation.isPending} className="bg-[#10B981] hover:bg-[#059669]">
              Confirm Refund Paid
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Refund Request">
        <form onSubmit={handleConfirmReject} className="space-y-5 mt-4">
          <div className="p-4 rounded-[16px] bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs font-semibold">
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
            <Button type="submit" variant="danger" loading={rejectMutation.isPending}>
              Reject & Restore Funds
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageBuyerRefunds;
