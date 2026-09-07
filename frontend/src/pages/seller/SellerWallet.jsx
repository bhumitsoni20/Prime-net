import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  HiCurrencyRupee, 
  HiClock, 
  HiCheckCircle, 
  HiXCircle, 
  HiCreditCard, 
  HiInformationCircle, 
  HiArrowSmUp, 
  HiQrcode, 
  HiPencilAlt, 
  HiCheck, 
  HiClipboardCopy,
  HiX,
  HiUpload
} from 'react-icons/hi';
import { apiGet, apiPost } from '../../services/api';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const SellerWallet = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [qrPreviewModal, setQrPreviewModal] = useState(null);
  
  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawUpiId, setWithdrawUpiId] = useState('');
  const [withdrawQrCode, setWithdrawQrCode] = useState('');
  
  // Settings Form State
  const [settingsUpiId, setSettingsUpiId] = useState('');
  const [settingsQrCode, setSettingsQrCode] = useState('');
  const fileInputRef = useRef(null);
  const settingsFileInputRef = useRef(null);

  // Fetch Wallet Data
  const { data: walletRes, isLoading } = useQuery({
    queryKey: ['sellerWallet'],
    queryFn: async () => {
      const res = await apiGet('/payouts/seller/wallet');
      return res.data;
    },
  });

  const walletData = walletRes || {
    walletBalance: 0,
    upiId: '',
    upiQrCode: '',
    stats: { availableBalance: 0, totalEarned: 0, totalWithdrawn: 0, pendingWithdrawn: 0 },
    withdrawals: [],
    transactions: [],
  };

  useEffect(() => {
    if (walletData.upiId) {
      setWithdrawUpiId(walletData.upiId);
      setSettingsUpiId(walletData.upiId);
    }
    if (walletData.upiQrCode) {
      setWithdrawQrCode(walletData.upiQrCode);
      setSettingsQrCode(walletData.upiQrCode);
    }
  }, [walletData.upiId, walletData.upiQrCode]);

  // Mutations
  const withdrawMutation = useMutation({
    mutationFn: async (payload) => {
      return await apiPost('/payouts/seller/withdraw', payload);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Withdrawal request submitted! It will be fulfilled within 24 hours.');
      setWithdrawModalOpen(false);
      setWithdrawAmount('');
      queryClient.invalidateQueries({ queryKey: ['sellerWallet'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to submit withdrawal request.');
    },
  });

  const settingsMutation = useMutation({
    mutationFn: async (payload) => {
      return await apiPost('/payouts/seller/settings', payload);
    },
    onSuccess: () => {
      toast.success('Payout settings saved successfully!');
      setSettingsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['sellerWallet'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save payout settings.');
    },
  });

  const handleQrUpload = (e, isSettings = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('QR code image must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      if (isSettings) {
        setSettingsQrCode(base64);
      } else {
        setWithdrawQrCode(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) {
      return toast.error('Please enter a valid amount.');
    }
    if (amount > walletData.walletBalance) {
      return toast.error(`Insufficient balance. Max available: ₹${walletData.walletBalance.toLocaleString()}`);
    }
    if (!withdrawUpiId.trim()) {
      return toast.error('Please enter your UPI ID.');
    }

    withdrawMutation.mutate({
      amount,
      upiId: withdrawUpiId.trim(),
      qrCode: withdrawQrCode,
    });
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    if (!settingsUpiId.trim()) {
      return toast.error('Please enter a valid UPI ID.');
    }

    settingsMutation.mutate({
      upiId: settingsUpiId.trim(),
      upiQrCode: settingsQrCode,
    });
  };

  const availableBalance = walletData.walletBalance || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em] mb-1 flex items-center gap-2.5">
            Seller Wallet & Payouts <HiCurrencyRupee className="text-[#5B4BFF] w-7 h-7" />
          </h1>
          <p className="text-[#64748B] text-[15px]">
            Manage your sales earnings, payout methods, and withdrawal requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            onClick={() => setSettingsModalOpen(true)}
            className="flex items-center gap-2 shadow-sm font-semibold"
          >
            <HiPencilAlt className="w-4 h-4" /> Payout Settings
          </Button>
          <Button 
            onClick={() => setWithdrawModalOpen(true)}
            disabled={availableBalance <= 0}
            className="flex items-center gap-2 shadow-[0_4px_14px_rgba(91,75,255,0.35)] font-semibold"
          >
            <HiArrowSmUp className="w-5 h-5" /> Withdraw Funds
          </Button>
        </div>
      </div>

      {/* 24-Hour Notice Banner */}
      <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-[20px] p-5 mb-8 flex items-start gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="w-10 h-10 rounded-[12px] bg-[#5B4BFF] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <HiClock className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[15px] font-bold text-[#1E1B4B] mb-0.5">
            Guaranteed 24-Hour Payout Fulfillment
          </h4>
          <p className="text-[13.5px] text-[#4338CA] leading-relaxed">
            All withdrawal requests are reviewed by administration and transferred directly to your registered UPI ID / QR code within <strong>24 hours</strong>.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Available Balance */}
        <div className="bg-[#0F172A] text-white rounded-[24px] p-6 relative overflow-hidden shadow-[0_8px_30px_-4px_rgba(15,23,42,0.3)]">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-36 h-36 bg-[#5B4BFF] rounded-full blur-[40px] opacity-40"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">Available Balance</span>
              <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></div>
            </div>
            <p className="text-[34px] font-extrabold tracking-tight mb-2">
              ₹{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[12px] text-[#94A3B8]">Ready for withdrawal anytime</p>
          </div>
        </div>

        {/* Total Earned (95% net) */}
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-[0.08em]">Total Sales Earned</span>
            <div className="w-8 h-8 rounded-[10px] bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
              <HiCheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[28px] font-extrabold text-[#0F172A] tracking-tight mb-1">
            ₹{walletData.stats.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[12px] text-[#64748B]">After 5% platform cut</p>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-[0.08em]">Total Withdrawn</span>
            <div className="w-8 h-8 rounded-[10px] bg-[#EEF2FF] text-[#5B4BFF] flex items-center justify-center">
              <HiCreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[28px] font-extrabold text-[#0F172A] tracking-tight mb-1">
            ₹{walletData.stats.totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[12px] text-[#64748B]">Successfully transferred</p>
        </div>

        {/* Pending Withdrawn */}
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-[0.08em]">Pending Payouts</span>
            <div className="w-8 h-8 rounded-[10px] bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
              <HiClock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[28px] font-extrabold text-[#0F172A] tracking-tight mb-1">
            ₹{walletData.stats.pendingWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[12px] text-[#D97706] font-medium">Processing within 24h</p>
        </div>
      </div>

      {/* Withdrawal Requests History */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-10">
        <div className="p-6 border-b border-[#F1F5F9] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-[18px] text-[#0F172A]">Withdrawal Requests</h3>
            <p className="text-xs text-[#64748B] mt-0.5">Track your payout requests and fulfillment statuses</p>
          </div>
          <Button size="sm" onClick={() => setWithdrawModalOpen(true)} disabled={availableBalance <= 0}>
            Request New Withdrawal
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-left text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] bg-white">
                <th className="p-5 pl-6">Date</th>
                <th className="p-5">Amount</th>
                <th className="p-5">UPI ID / QR</th>
                <th className="p-5">Status</th>
                <th className="p-5 pr-6">Admin Note / Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {walletData.withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#64748B] bg-[#F8FAFC] font-medium">
                    No withdrawal requests yet.
                  </td>
                </tr>
              ) : (
                walletData.withdrawals.map((w) => (
                  <tr key={w._id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-5 pl-6 text-sm text-[#475569] font-medium whitespace-nowrap">
                      {new Date(w.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-5 text-sm font-extrabold text-[#0F172A] whitespace-nowrap">
                      ₹{w.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-5 text-sm text-[#334155] font-mono">
                      <div className="flex items-center gap-2">
                        <span>{w.upiId}</span>
                        {w.qrCode && (
                          <button 
                            type="button" 
                            onClick={() => setQrPreviewModal(w.qrCode)}
                            className="p-1 text-[#5B4BFF] hover:bg-[#EEF2FF] rounded-[6px] transition-colors"
                            title="View QR Code"
                          >
                            <HiQrcode className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-5 whitespace-nowrap">
                      {w.status === 'completed' ? (
                        <Badge variant="success" className="font-bold flex items-center gap-1 w-fit">
                          <HiCheck className="w-3.5 h-3.5" /> Completed
                        </Badge>
                      ) : w.status === 'pending' ? (
                        <Badge variant="warning" className="font-bold flex items-center gap-1 w-fit bg-amber-50 text-amber-700 border-amber-200">
                          <HiClock className="w-3.5 h-3.5" /> Pending (Within 24h)
                        </Badge>
                      ) : (
                        <Badge variant="danger" className="font-bold flex items-center gap-1 w-fit">
                          <HiXCircle className="w-3.5 h-3.5" /> Rejected
                        </Badge>
                      )}
                    </td>
                    <td className="p-5 pr-6 text-sm text-[#64748B]">
                      {w.transactionReference ? (
                        <div className="font-mono text-xs text-[#5B4BFF] font-semibold">Ref: {w.transactionReference}</div>
                      ) : null}
                      {w.adminNote ? (
                        <div className="text-xs text-[#EF4444] mt-0.5">{w.adminNote}</div>
                      ) : (!w.transactionReference && <span className="text-[#94A3B8] text-xs">-</span>)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales & Commissions Breakdown */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="p-6 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <h3 className="font-bold text-[18px] text-[#0F172A]">Sales & Commission Earnings</h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Automatically credited upon order completion (5% platform cut applied)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-left text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] bg-white">
                <th className="p-5 pl-6">Date</th>
                <th className="p-5">Transaction ID</th>
                <th className="p-5 text-right">Sold Price (Gross)</th>
                <th className="p-5 text-right">Platform Fee (5%)</th>
                <th className="p-5 pr-6 text-right">Net Credited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {walletData.transactions.filter(t => t.type === 'credit').length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#64748B] bg-[#F8FAFC] font-medium">
                    No completed sales transactions yet.
                  </td>
                </tr>
              ) : (
                walletData.transactions.filter(t => t.type === 'credit').map((tx) => (
                  <tr key={tx._id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-5 pl-6 text-sm text-[#475569] font-medium whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-5 text-sm font-mono text-[#64748B]">{tx.transactionId}</td>
                    <td className="p-5 text-right text-sm text-[#0F172A] font-semibold whitespace-nowrap">
                      ₹{tx.grossAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-5 text-right text-sm text-[#EF4444] font-semibold whitespace-nowrap">
                      -₹{tx.platformCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-5 pr-6 text-right text-sm text-[#16A34A] font-extrabold whitespace-nowrap">
                      +₹{tx.netEarning.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Request Modal */}
      <Modal isOpen={withdrawModalOpen} onClose={() => setWithdrawModalOpen(false)} title="Request Withdrawal">
        <form onSubmit={handleWithdrawSubmit} className="space-y-5">
          <div className="bg-[#F8FAFC] p-4 rounded-[16px] border border-[#E2E8F0] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-[0.08em]">Available for Withdrawal</p>
              <p className="text-2xl font-extrabold text-[#0F172A] mt-0.5">
                ₹{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setWithdrawAmount(availableBalance.toString())}
              className="px-3 py-1.5 bg-[#5B4BFF]/10 text-[#5B4BFF] hover:bg-[#5B4BFF]/20 rounded-full text-xs font-bold transition-colors"
            >
              Withdraw All
            </button>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-[0.08em]">
              Withdrawal Amount (₹)
            </label>
            <input
              type="number"
              min="1"
              max={availableBalance}
              step="any"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="e.g. 500"
              className="w-full bg-white border border-[#E2E8F0] rounded-[14px] px-4 py-3 text-[#0F172A] text-sm focus:outline-none focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF]"
              required
            />
            {/* Quick preset buttons */}
            <div className="flex gap-2 mt-2">
              {[500, 1000, 2000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setWithdrawAmount(preset.toString())}
                  disabled={preset > availableBalance}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] rounded-[8px] transition-colors disabled:opacity-40"
                >
                  ₹{preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-[0.08em]">
              UPI ID for Payment Transfer
            </label>
            <input
              type="text"
              value={withdrawUpiId}
              onChange={(e) => setWithdrawUpiId(e.target.value)}
              placeholder="e.g. yourname@oksbi"
              className="w-full bg-white border border-[#E2E8F0] rounded-[14px] px-4 py-3 text-[#0F172A] text-sm focus:outline-none focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF]"
              required
            />
          </div>

          {/* Optional QR Code */}
          <div>
            <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-[0.08em]">
              UPI QR Code (Optional)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={(e) => handleQrUpload(e, false)}
              className="hidden"
            />
            {withdrawQrCode ? (
              <div className="flex items-center gap-4 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px]">
                <img src={withdrawQrCode} alt="UPI QR" className="w-16 h-16 object-contain rounded-[8px] border" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#0F172A]">UPI QR Attached</p>
                  <p className="text-[11px] text-[#64748B]">Admin will scan to transfer</p>
                </div>
                <button
                  type="button"
                  onClick={() => setWithdrawQrCode('')}
                  className="p-1 text-[#EF4444] hover:bg-[#FEF2F2] rounded-full"
                >
                  <HiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#CBD5E1] hover:border-[#5B4BFF] bg-[#F8FAFC] rounded-[14px] py-3.5 px-4 text-xs font-semibold text-[#64748B] hover:text-[#5B4BFF] transition-colors flex items-center justify-center gap-2"
              >
                <HiUpload className="w-4 h-4" /> Upload QR Code Image (Optional)
              </button>
            )}
          </div>

          <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-[14px] p-3 text-xs text-[#4338CA] leading-relaxed flex items-start gap-2">
            <HiClock className="w-4 h-4 text-[#5B4BFF] shrink-0 mt-0.5" />
            <span>Withdrawal will be verified and paid via UPI within <strong>24 hours</strong>.</span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
            <Button variant="secondary" type="button" onClick={() => setWithdrawModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={withdrawMutation.isPending}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Payout Settings Modal */}
      <Modal isOpen={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} title="Default Payout Settings">
        <form onSubmit={handleSettingsSubmit} className="space-y-5">
          <p className="text-xs text-[#64748B]">
            Save your default UPI ID and QR code so your withdrawal requests are auto-filled.
          </p>

          <div>
            <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-[0.08em]">
              Default UPI ID
            </label>
            <input
              type="text"
              value={settingsUpiId}
              onChange={(e) => setSettingsUpiId(e.target.value)}
              placeholder="e.g. yourname@upi"
              className="w-full bg-white border border-[#E2E8F0] rounded-[14px] px-4 py-3 text-[#0F172A] text-sm focus:outline-none focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF]"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-[0.08em]">
              Default UPI QR Code Image
            </label>
            <input
              type="file"
              ref={settingsFileInputRef}
              accept="image/*"
              onChange={(e) => handleQrUpload(e, true)}
              className="hidden"
            />
            {settingsQrCode ? (
              <div className="flex items-center gap-4 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px]">
                <img src={settingsQrCode} alt="Default UPI QR" className="w-16 h-16 object-contain rounded-[8px] border" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#0F172A]">Default QR Saved</p>
                  <p className="text-[11px] text-[#64748B]">Used for instant payout scanning</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsQrCode('')}
                  className="p-1 text-[#EF4444] hover:bg-[#FEF2F2] rounded-full"
                >
                  <HiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => settingsFileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#CBD5E1] hover:border-[#5B4BFF] bg-[#F8FAFC] rounded-[14px] py-4 px-4 text-xs font-semibold text-[#64748B] hover:text-[#5B4BFF] transition-colors flex items-center justify-center gap-2"
              >
                <HiUpload className="w-4 h-4" /> Upload Default QR Code Image
              </button>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
            <Button variant="secondary" type="button" onClick={() => setSettingsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={settingsMutation.isPending}>
              Save Payout Details
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Code Quick Preview Modal */}
      {qrPreviewModal && (
        <Modal isOpen={!!qrPreviewModal} onClose={() => setQrPreviewModal(null)} title="UPI QR Code">
          <div className="flex flex-col items-center justify-center p-4">
            <img src={qrPreviewModal} alt="UPI QR Code" className="max-w-[280px] max-h-[280px] object-contain rounded-[16px] border shadow-sm" />
            <Button variant="secondary" className="mt-6" onClick={() => setQrPreviewModal(null)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SellerWallet;
