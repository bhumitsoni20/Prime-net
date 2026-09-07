import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  HiCurrencyRupee, 
  HiClock, 
  HiCheckCircle, 
  HiXCircle, 
  HiSearch, 
  HiQrcode, 
  HiCheck, 
  HiClipboardCopy 
} from 'react-icons/hi';
import { apiGet, apiPost } from '../../services/api';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';

const ManagePayouts = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedPayout, setSelectedPayout] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [qrModalUrl, setQrModalUrl] = useState(null);
  
  const [txnRef, setTxnRef] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const { data: payoutsRes, isLoading } = useQuery({
    queryKey: ['adminPayouts', statusFilter, page],
    queryFn: async () => {
      const res = await apiGet(`/payouts/admin/requests?status=${statusFilter}&page=${page}&limit=15`);
      return res;
    },
  });

  const payouts = payoutsRes?.data || [];
  const pagination = payoutsRes?.pagination || { page: 1, pages: 1, total: 0 };
  const stats = payoutsRes?.stats || { pendingCount: 0, pendingTotal: 0, completedTotal: 0 };

  const approveMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      return await apiPost(`/payouts/admin/requests/${id}/approve`, payload);
    },
    onSuccess: () => {
      toast.success('Payout marked as paid and completed successfully!');
      setApproveModalOpen(false);
      setSelectedPayout(null);
      setTxnRef('');
      setAdminNote('');
      queryClient.invalidateQueries({ queryKey: ['adminPayouts'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to approve payout.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      return await apiPost(`/payouts/admin/requests/${id}/reject`, payload);
    },
    onSuccess: () => {
      toast.success('Payout request rejected and balance refunded to seller.');
      setRejectModalOpen(false);
      setSelectedPayout(null);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['adminPayouts'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to reject payout.');
    },
  });

  const handleCopyUpi = (upiId) => {
    navigator.clipboard.writeText(upiId);
    toast.success(`Copied "${upiId}" to clipboard!`);
  };

  const handleOpenApprove = (payout) => {
    setSelectedPayout(payout);
    setTxnRef('');
    setAdminNote('');
    setApproveModalOpen(true);
  };

  const handleOpenReject = (payout) => {
    setSelectedPayout(payout);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmApprove = (e) => {
    e.preventDefault();
    if (!selectedPayout) return;
    approveMutation.mutate({
      id: selectedPayout._id,
      payload: { transactionReference: txnRef.trim(), adminNote: adminNote.trim() },
    });
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!selectedPayout) return;
    if (!rejectReason.trim()) {
      return toast.error('Please specify a rejection reason.');
    }
    rejectMutation.mutate({
      id: selectedPayout._id,
      payload: { rejectionReason: rejectReason.trim() },
    });
  };

  const filteredPayouts = payouts.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.seller?.name?.toLowerCase().includes(q) ||
      p.seller?.email?.toLowerCase().includes(q) ||
      p.upiId?.toLowerCase().includes(q) ||
      p._id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em] mb-1 flex items-center gap-2.5">
            Seller Payouts Management <HiCurrencyRupee className="text-[#5B4BFF] w-7 h-7" />
          </h1>
          <p className="text-[#64748B] text-[15px]">
            Review seller withdrawal requests, scan UPI QR codes to pay, and confirm disbursements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-[0.08em]">Pending Requests</span>
            <div className="w-9 h-9 rounded-[12px] bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <HiClock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[32px] font-extrabold text-[#0F172A] tracking-tight">{stats.pendingCount}</p>
          <p className="text-[12px] text-amber-600 font-medium mt-0.5">Need fulfillment within 24h</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-[0.08em]">Total Pending to Pay</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#EEF2FF] text-[#5B4BFF] flex items-center justify-center font-bold">
              <HiCurrencyRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[32px] font-extrabold text-[#5B4BFF] tracking-tight">
            ₹{stats.pendingTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[12px] text-[#64748B] mt-0.5">Awaiting admin transfer</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-[0.08em]">Total Paid Out</span>
            <div className="w-9 h-9 rounded-[12px] bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <HiCheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[32px] font-extrabold text-emerald-600 tracking-tight">
            ₹{stats.completedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[12px] text-[#64748B] mt-0.5">Disbursed to sellers</p>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="p-5 border-b border-[#F1F5F9] bg-[#F8FAFC] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-[14px] border border-[#E2E8F0] shadow-sm overflow-x-auto">
            {[
              { label: 'Pending', value: 'pending' },
              { label: 'Completed', value: 'completed' },
              { label: 'Rejected', value: 'rejected' },
              { label: 'All Requests', value: 'all' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                className={`px-4 py-2 rounded-[10px] text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === tab.value ? 'bg-[#5B4BFF] text-white shadow-sm' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search by seller, UPI, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-[12px] pl-9 pr-4 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#5B4BFF]/20 focus:border-[#5B4BFF]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-left text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] bg-white">
                <th className="p-5 pl-6">Seller Details</th>
                <th className="p-5">Requested Amount</th>
                <th className="p-5">Payout UPI & QR</th>
                <th className="p-5">Date</th>
                <th className="p-5">Status</th>
                <th className="p-5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr><td colSpan={6} className="p-16 text-center"><Spinner size="md" /></td></tr>
              ) : filteredPayouts.length === 0 ? (
                <tr><td colSpan={6} className="p-16 text-center text-[#64748B] bg-[#F8FAFC] font-medium text-sm">No payout requests found for this filter.</td></tr>
              ) : (
                filteredPayouts.map((p) => (
                  <tr key={p._id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-5 pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar src={p.seller?.avatar} name={p.seller?.name || 'Seller'} size="sm" />
                        <div>
                          <p className="text-sm font-bold text-[#0F172A] leading-snug">{p.seller?.name || 'Unknown'}</p>
                          <p className="text-xs text-[#64748B]">{p.seller?.email || 'N/A'}</p>
                          {p.seller?.phone && <p className="text-[11px] text-[#94A3B8] mt-0.5">{p.seller.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-5 whitespace-nowrap">
                      <p className="text-base font-extrabold text-[#0F172A]">
                        ₹{p.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-[11px] text-[#94A3B8]">Wallet: ₹{(p.seller?.walletBalance || 0).toLocaleString()}</p>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#0F172A] bg-[#F1F5F9] px-2.5 py-1 rounded-[8px]">
                          {p.upiId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyUpi(p.upiId)}
                          className="p-1.5 text-[#64748B] hover:text-[#5B4BFF] hover:bg-[#EEF2FF] rounded-[8px] transition-colors"
                          title="Copy UPI ID"
                        >
                          <HiClipboardCopy className="w-4 h-4" />
                        </button>
                        {p.qrCode && (
                          <button
                            type="button"
                            onClick={() => setQrModalUrl(p.qrCode)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#5B4BFF] bg-[#EEF2FF] hover:bg-[#E0E7FF] px-2 py-1 rounded-[8px] transition-colors shadow-sm"
                            title="Scan QR Code"
                          >
                            <HiQrcode className="w-4 h-4" /> Scan QR
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-xs text-[#64748B] whitespace-nowrap">
                      <div>{new Date(p.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <div className="text-[11px] text-[#94A3B8]">{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="p-5 whitespace-nowrap">
                      {p.status === 'completed' ? (
                        <Badge variant="success" className="font-bold flex items-center gap-1 w-fit"><HiCheck className="w-3.5 h-3.5" /> Paid</Badge>
                      ) : p.status === 'pending' ? (
                        <Badge variant="warning" className="font-bold flex items-center gap-1 w-fit bg-amber-50 text-amber-700 border-amber-200"><HiClock className="w-3.5 h-3.5" /> Pending</Badge>
                      ) : (
                        <Badge variant="danger" className="font-bold flex items-center gap-1 w-fit"><HiXCircle className="w-3.5 h-3.5" /> Rejected</Badge>
                      )}
                    </td>
                    <td className="p-5 pr-6 text-right whitespace-nowrap">
                      {p.status === 'pending' ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleOpenApprove(p)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-[10px] text-xs font-bold shadow-sm transition-all"
                          >
                            <HiCheck className="w-4 h-4" /> Mark as Paid
                          </button>
                          <button
                            onClick={() => handleOpenReject(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA] rounded-[10px] text-xs font-bold transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#94A3B8] font-mono">
                          {p.transactionReference ? `Ref: ${p.transactionReference}` : p.adminNote || '-'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="p-5 border-t border-[#F1F5F9] flex justify-center">
            <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={(newPage) => setPage(newPage)} />
          </div>
        )}
      </div>

      {qrModalUrl && (
        <Modal isOpen={!!qrModalUrl} onClose={() => setQrModalUrl(null)} title="Seller UPI QR Code">
          <div className="flex flex-col items-center justify-center p-4">
            <div className="p-4 bg-white border-2 border-dashed border-[#CBD5E1] rounded-[24px] shadow-sm mb-4">
              <img src={qrModalUrl} alt="Seller UPI QR" className="w-64 h-64 object-contain rounded-[12px]" />
            </div>
            <p className="text-xs text-[#64748B] text-center max-w-xs">
              Scan with your UPI app (Google Pay, PhonePe, Paytm, etc.) to transfer funds to the seller.
            </p>
            <Button variant="secondary" className="mt-6" onClick={() => setQrModalUrl(null)}>Done</Button>
          </div>
        </Modal>
      )}

      <Modal isOpen={approveModalOpen} onClose={() => setApproveModalOpen(false)} title="Confirm Payment Transfer">
        <form onSubmit={handleConfirmApprove} className="space-y-4">
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-4 rounded-[16px] text-sm text-[#166534]">
            <p className="font-bold mb-1">Confirming Payout of ₹{selectedPayout?.amount.toLocaleString()}</p>
            <p className="text-xs text-[#15803D]">
              Beneficiary: <strong>{selectedPayout?.seller?.name}</strong> ({selectedPayout?.upiId})
            </p>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#334155] mb-2 uppercase tracking-[0.08em]">
              UPI / Bank Transaction Reference (UTR / Txn ID)
            </label>
            <input
              type="text"
              placeholder="e.g. 423871982731"
              value={txnRef}
              onChange={(e) => setTxnRef(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#334155] mb-2 uppercase tracking-[0.08em]">
              Admin Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid via GPay"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
            <Button variant="secondary" type="button" onClick={() => setApproveModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={approveMutation.isPending} className="!bg-[#10B981] hover:!bg-[#059669]">
              Confirm Payment Complete
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Withdrawal Request">
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <div className="bg-[#FEF2F2] border border-[#FECACA] p-4 rounded-[16px] text-xs text-[#991B1B] leading-relaxed">
            Rejecting this request will automatically <strong>refund ₹{selectedPayout?.amount.toLocaleString()}</strong> back to the seller's wallet balance.
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#334155] mb-2 uppercase tracking-[0.08em]">
              Rejection Reason *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Invalid UPI ID, please update in payout settings and retry."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-[12px] p-3 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20 focus:border-[#EF4444]"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
            <Button variant="secondary" type="button" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={rejectMutation.isPending} variant="danger">
              Reject & Refund
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManagePayouts;
