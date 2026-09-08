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
  HiClipboardCopy,
  HiSparkles
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-[26px] sm:text-[28px] font-extrabold text-[#0F172A] tracking-[-0.03em]">
              Seller Payouts & Disbursements
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#5B4BFF]/10 text-[#5B4BFF] border border-[#5B4BFF]/20">
              <HiSparkles className="w-3.5 h-3.5" /> Escrow Settlement
            </span>
          </div>
          <p className="text-[#64748B] text-[14.5px]">
            Review merchant withdrawal requests, scan UPI QR codes to pay, and confirm disbursements.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-[#E2E8F0] rounded-[22px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(217,119,6,0.08)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-[0.08em]">Pending Requests</span>
            <div className="w-10 h-10 rounded-[12px] bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
              <HiClock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[30px] font-extrabold text-amber-600 tracking-tight">{stats.pendingCount}</p>
          <p className="text-[12px] text-[#94A3B8] font-medium mt-1">Need fulfillment within 24h</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[22px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(91,75,255,0.08)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-[0.08em]">Total Pending to Pay</span>
            <div className="w-10 h-10 rounded-[12px] bg-indigo-50 border border-indigo-200 text-[#5B4BFF] flex items-center justify-center font-bold">
              <HiCurrencyRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[30px] font-extrabold text-[#0F172A] tracking-tight">
            ₹{stats.pendingTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[12px] text-[#94A3B8] font-medium mt-1">Awaiting admin transfer</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[22px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(22,163,74,0.08)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-[0.08em]">Total Paid Out</span>
            <div className="w-10 h-10 rounded-[12px] bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
              <HiCheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[30px] font-extrabold text-emerald-600 tracking-tight">
            ₹{stats.completedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[12px] text-[#94A3B8] font-medium mt-1">Disbursed to merchant wallets</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="p-4 sm:p-6 border-b border-[#F1F5F9] bg-[#F8FAFC]/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-[14px]">
            {[
              { label: 'Pending', value: 'pending' },
              { label: 'Completed', value: 'completed' },
              { label: 'Rejected', value: 'rejected' },
              { label: 'All Requests', value: 'all' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                className={`px-4 py-1.5 rounded-[10px] text-[12.5px] font-bold transition-all whitespace-nowrap ${
                  statusFilter === tab.value ? 'bg-white text-[#0F172A] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search by seller, UPI, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-[12px] pl-10 pr-4 py-2 text-[13.5px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-left text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] bg-[#F8FAFC]">
                <th className="p-5 pl-7">Seller Details</th>
                <th className="p-5">Requested Amount</th>
                <th className="p-5">Payout UPI & QR</th>
                <th className="p-5">Submission Date</th>
                <th className="p-5">Status</th>
                <th className="p-5 pr-7 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-[#94A3B8] font-medium animate-pulse">
                    Loading payout queue...
                  </td>
                </tr>
              ) : filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-[#64748B] bg-[#F8FAFC]/50 font-medium text-sm">
                    No payout requests found for this filter.
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((p) => (
                  <tr key={p._id} className="hover:bg-indigo-50/20 transition-colors group">
                    <td className="p-5 pl-7">
                      <div className="flex items-center gap-3">
                        <Avatar src={p.seller?.avatar} name={p.seller?.name || 'Seller'} size="md" />
                        <div>
                          <p className="text-[14.5px] font-bold text-[#0F172A] group-hover:text-[#5B4BFF] transition-colors leading-snug">
                            {p.seller?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-[#64748B]">{p.seller?.email || 'N/A'}</p>
                          {p.seller?.phone && <p className="text-[11px] font-mono text-[#94A3B8] mt-0.5">{p.seller.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-5 whitespace-nowrap">
                      <p className="text-[16px] font-extrabold text-[#0F172A]">
                        ₹{p.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-[11px] text-[#94A3B8] font-medium">Balance: ₹{(p.seller?.walletBalance || 0).toLocaleString()}</p>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyUpi(p.upiId)}
                          className="inline-flex items-center gap-1.5 text-[12.5px] font-mono font-bold text-[#5B4BFF] bg-indigo-50/80 border border-indigo-100 hover:border-indigo-300 px-2.5 py-1 rounded-[8px] transition-colors"
                        >
                          <span>{p.upiId}</span>
                          <HiClipboardCopy className="w-3.5 h-3.5" />
                        </button>
                        {p.qrCode && (
                          <button
                            type="button"
                            onClick={() => setQrModalUrl(p.qrCode)}
                            className="inline-flex items-center gap-1 text-[12px] font-bold text-[#5B4BFF] bg-indigo-100 hover:bg-indigo-200 px-2.5 py-1 rounded-[8px] transition-colors shadow-xs"
                            title="Scan QR Code"
                          >
                            <HiQrcode className="w-4 h-4" /> Scan QR
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-xs text-[#64748B] whitespace-nowrap">
                      <div className="font-semibold text-[#0F172A]">{new Date(p.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <div className="text-[11px] text-[#94A3B8]">{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="p-5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider border ${
                        p.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : p.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          p.status === 'completed' ? 'bg-emerald-600' : p.status === 'rejected' ? 'bg-rose-600' : 'bg-amber-600'
                        }`} />
                        {p.status === 'completed' ? 'Paid' : p.status === 'rejected' ? 'Rejected' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-5 pr-7 text-right whitespace-nowrap">
                      {p.status === 'pending' ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleOpenApprove(p)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[10px] text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all"
                          >
                            <HiCheck className="w-4 h-4" /> Mark Paid
                          </button>
                          <button
                            onClick={() => handleOpenReject(p)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-[10px] text-xs font-bold transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[12px] text-[#94A3B8] font-mono bg-[#F1F5F9] px-2.5 py-1 rounded-[8px]">
                          {p.transactionReference ? `UTR: ${p.transactionReference}` : p.adminNote || '-'}
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
          <div className="p-4 border-t border-[#F1F5F9] flex justify-center bg-[#F8FAFC]">
            <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={(newPage) => setPage(newPage)} />
          </div>
        )}
      </div>

      {qrModalUrl && (
        <Modal isOpen={!!qrModalUrl} onClose={() => setQrModalUrl(null)} title="Seller UPI QR Code">
          <div className="flex flex-col items-center justify-center p-3">
            <div className="p-4 bg-white border border-slate-200 rounded-[20px] shadow-sm mb-4">
              <img src={qrModalUrl} alt="Seller UPI QR" className="w-64 h-64 object-contain rounded-[12px]" />
            </div>
            <p className="text-[13px] text-[#64748B] text-center max-w-xs leading-relaxed">
              Scan with your UPI app (Google Pay, PhonePe, Paytm, BHIM) to disburse funds to the merchant.
            </p>
            <Button variant="secondary" className="mt-5 font-bold" onClick={() => setQrModalUrl(null)}>Close</Button>
          </div>
        </Modal>
      )}

      <Modal isOpen={approveModalOpen} onClose={() => setApproveModalOpen(false)} title="Confirm Payment Transfer">
        <form onSubmit={handleConfirmApprove} className="space-y-4 mt-2">
          <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-[16px] text-sm text-emerald-900">
            <p className="font-extrabold text-[15px] mb-1">Confirming Payout of ₹{selectedPayout?.amount.toLocaleString()}</p>
            <p className="text-xs text-emerald-700">
              Beneficiary: <strong>{selectedPayout?.seller?.name}</strong> ({selectedPayout?.upiId})
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              UTR / Transaction Reference (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 423891002341"
              value={txnRef}
              onChange={(e) => setTxnRef(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-3.5 py-2.5 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#5B4BFF] focus:ring-4 focus:ring-[#5B4BFF]/10 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Internal Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid via HDFC Current Account"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-3.5 py-2.5 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#5B4BFF] focus:ring-4 focus:ring-[#5B4BFF]/10 transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
            <Button type="button" variant="secondary" onClick={() => setApproveModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={approveMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20">
              Confirm & Mark Paid
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Payout Request">
        <form onSubmit={handleConfirmReject} className="space-y-4 mt-2">
          <div className="p-4 rounded-[16px] bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold leading-relaxed">
            ⚠️ Rejecting this request will <strong>refund ₹{selectedPayout?.amount.toLocaleString()}</strong> back to the seller's active wallet balance.
          </div>

          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Rejection Reason (Required)
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Invalid UPI ID, Bank server error, KYC incomplete..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] p-3 text-[14px] text-[#0F172A] focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all placeholder:text-[#94A3B8]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
            <Button type="button" variant="secondary" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="danger" loading={rejectMutation.isPending} className="font-bold">
              Reject & Refund Balance
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManagePayouts;
