import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  HiCurrencyRupee, 
  HiClock, 
  HiCheckCircle, 
  HiXCircle, 
  HiCreditCard, 
  HiArrowSmUp, 
  HiQrcode, 
  HiPencilAlt, 
  HiCheck, 
  HiClipboardCopy,
  HiX,
  HiUpload,
  HiOutlineSparkles
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
      return toast.error(`Insufficient balance. Max available: ₹${walletData.walletBalance.toLocaleString('en-IN')}`);
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
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Spinner size="lg" />
        <span className="text-sm font-semibold text-[#64748B]">Loading wallet & payout ledger...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[26px] font-extrabold text-[#0F172A] tracking-[-0.02em]">
              Wallet & Payouts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
              95% Net Direct
            </span>
          </div>
          <p className="text-[#64748B] text-[14px]">
            Manage sales earnings, configure UPI disbursement methods, and request withdrawals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            onClick={() => setSettingsModalOpen(true)}
            className="flex items-center gap-2 font-bold border-[#E2E8F0]"
          >
            <HiPencilAlt className="w-4 h-4 text-[#5B4BFF]" /> Payout Settings
          </Button>
          <Button 
            onClick={() => setWithdrawModalOpen(true)}
            disabled={availableBalance <= 0}
            className="flex items-center gap-2 bg-[#5B4BFF] hover:bg-[#4F3FE8] text-white font-bold shadow-[0_4px_14px_rgba(91,75,255,0.25)]"
          >
            <HiArrowSmUp className="w-5 h-5" /> Withdraw Funds
          </Button>
        </div>
      </div>

      {/* 24-Hour Notice Banner */}
      <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-[20px] p-5 flex items-start gap-4 shadow-xs">
        <div className="w-10 h-10 rounded-[12px] bg-[#5B4BFF] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <HiClock className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[15px] font-extrabold text-[#1E1B4B] mb-0.5">
            Guaranteed 24-Hour Payout Fulfillment
          </h4>
          <p className="text-[13.5px] text-[#4338CA] leading-relaxed">
            All withdrawal requests are processed by StreamKart administration and transferred directly to your registered UPI ID / QR code within <strong>24 hours</strong>.
          </p>
        </div>
      </div>

      {/* Stats Grid (Strict Light Mode) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#EEF2FF] rounded-[24px] p-6 border border-[#C7D2FE] shadow-[0_4px_20px_rgba(91,75,255,0.06)] relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-28 h-28 bg-[#5B4BFF]/15 rounded-full blur-[24px] pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-bold text-[#5B4BFF] uppercase tracking-wider">Available Balance</span>
              <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
            </div>
            <p className="text-[30px] font-black text-[#0F172A] tracking-tight mb-1">
              ₹{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[12px] text-[#64748B] font-medium">Ready for instant withdrawal</p>
          </div>
        </div>

        {/* Total Earned */}
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Total Sales Earned</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <HiCheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[26px] font-extrabold text-[#0F172A] tracking-tight mb-1">
            ₹{walletData.stats.totalEarned.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[12px] text-[#64748B] font-medium">Net earnings (95% cut)</p>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Total Withdrawn</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#EEF2FF] text-[#5B4BFF] flex items-center justify-center">
              <HiCreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[26px] font-extrabold text-[#0F172A] tracking-tight mb-1">
            ₹{walletData.stats.totalWithdrawn.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[12px] text-[#64748B] font-medium">Disbursed to your account</p>
        </div>

        {/* Pending Payouts */}
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Pending Payouts</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
              <HiClock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[26px] font-extrabold text-[#D97706] tracking-tight mb-1">
            ₹{walletData.stats.pendingWithdrawn.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[12px] text-[#D97706] font-medium">In review (within 24h)</p>
        </div>
      </div>

      {/* Withdrawal Requests History */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="p-6 border-b border-[#F1F5F9] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-[17px] text-[#0F172A]">Withdrawal Requests</h3>
            <p className="text-[12px] text-[#64748B]">Track payout requests submitted for administrative review</p>
          </div>
          <Button 
            size="sm" 
            onClick={() => setWithdrawModalOpen(true)} 
            disabled={availableBalance <= 0}
            className="font-bold text-[12px]"
          >
            + Request Withdrawal
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-left text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] bg-white">
                <th className="p-4 pl-6">Request Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">UPI Destination</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Reference / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {walletData.withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#64748B] bg-[#F8FAFC] font-medium">
                    No withdrawal requests created yet.
                  </td>
                </tr>
              ) : (
                walletData.withdrawals.map((w) => (
                  <tr key={w._id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-4 pl-6 text-[13px] text-[#475569] font-semibold whitespace-nowrap">
                      {new Date(w.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-[15px] font-black text-[#0F172A] whitespace-nowrap">
                      ₹{w.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-[13px] text-[#334155] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{w.upiId}</span>
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
                    <td className="p-4 whitespace-nowrap">
                      {w.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                          <HiCheck className="w-3.5 h-3.5" /> Completed
                        </span>
                      ) : w.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
                          <HiClock className="w-3.5 h-3.5" /> Pending (Within 24h)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]">
                          <HiXCircle className="w-3.5 h-3.5" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right text-[13px] text-[#64748B]">
                      {w.transactionReference ? (
                        <div className="font-mono text-xs text-[#5B4BFF] font-bold">Ref: {w.transactionReference}</div>
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

      {/* Sales & Commission Ledger */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="p-6 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <h3 className="font-extrabold text-[17px] text-[#0F172A]">Sales & Commission Earnings</h3>
          <p className="text-[12px] text-[#64748B]">
            Automatically credited upon verified order completion (5% platform fee applied)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-left text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] bg-white">
                <th className="p-4 pl-6">Order Date</th>
                <th className="p-4">Transaction Ref</th>
                <th className="p-4 text-right">Gross Sold Price</th>
                <th className="p-4 text-right">Platform Fee (5%)</th>
                <th className="p-4 pr-6 text-right">Net Credited</th>
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
                    <td className="p-4 pl-6 text-[13px] text-[#475569] font-medium whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-[13px] font-mono text-[#64748B]">{tx.transactionId}</td>
                    <td className="p-4 text-right text-[14px] text-[#0F172A] font-bold whitespace-nowrap">
                      ₹{tx.grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-right text-[13px] text-[#EF4444] font-bold whitespace-nowrap">
                      -₹{tx.platformCommission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 pr-6 text-right text-[15px] text-[#16A34A] font-black whitespace-nowrap">
                      +₹{tx.netEarning.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Request Modal */}
      <Modal isOpen={withdrawModalOpen} onClose={() => setWithdrawModalOpen(false)} title="Request Payout Withdrawal">
        <form onSubmit={handleWithdrawSubmit} className="space-y-5 p-1">
          <div className="bg-[#F8FAFC] p-4 rounded-[16px] border border-[#E2E8F0] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Available for Withdrawal</p>
              <p className="text-[24px] font-black text-[#0F172A] mt-0.5">
                ₹{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setWithdrawAmount(availableBalance.toString())}
              className="px-3.5 py-1.5 bg-[#EEF2FF] text-[#5B4BFF] hover:bg-[#E0E7FF] rounded-full text-xs font-bold transition-colors"
            >
              Withdraw All
            </button>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Withdrawal Amount (₹)
            </label>
            <input
              type="number"
              min="1"
              max={availableBalance}
              step="any"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="e.g. 1000"
              className="w-full bg-white border border-[#E2E8F0] rounded-[14px] px-4 py-3 text-[#0F172A] text-[15px] font-bold focus:outline-none focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF]"
              required
            />
            {/* Quick preset buttons */}
            <div className="flex gap-2 mt-2.5">
              {[500, 1000, 2000, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setWithdrawAmount(preset.toString())}
                  disabled={preset > availableBalance}
                  className="px-3 py-1 text-xs font-bold bg-[#F8FAFC] hover:bg-[#EEF2FF] text-[#475569] hover:text-[#5B4BFF] rounded-[8px] border border-[#E2E8F0] transition-colors disabled:opacity-40"
                >
                  ₹{preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              UPI ID for Payment Transfer
            </label>
            <input
              type="text"
              value={withdrawUpiId}
              onChange={(e) => setWithdrawUpiId(e.target.value)}
              placeholder="e.g. yourname@okhdfcbank"
              className="w-full bg-white border border-[#E2E8F0] rounded-[14px] px-4 py-3 text-[#0F172A] text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF]"
              required
            />
          </div>

          {/* Optional QR Code */}
          <div>
            <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              UPI QR Code Image (Optional)
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
                  <p className="text-[11px] text-[#64748B]">Admin will scan to disburse funds</p>
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
                className="w-full border-2 border-dashed border-[#CBD5E1] hover:border-[#5B4BFF] bg-[#F8FAFC] rounded-[14px] py-3.5 px-4 text-xs font-bold text-[#64748B] hover:text-[#5B4BFF] transition-colors flex items-center justify-center gap-2"
              >
                <HiUpload className="w-4 h-4" /> Upload QR Code Image
              </button>
            )}
          </div>

          <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-[14px] p-3 text-xs text-[#4338CA] leading-relaxed flex items-start gap-2">
            <HiClock className="w-4 h-4 text-[#5B4BFF] shrink-0 mt-0.5" />
            <span>Withdrawal will be reviewed and transferred to your UPI ID within <strong>24 hours</strong>.</span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
            <Button variant="secondary" type="button" onClick={() => setWithdrawModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={withdrawMutation.isPending} className="bg-[#5B4BFF] hover:bg-[#4F3FE8] text-white">
              Submit Withdrawal Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Payout Settings Modal */}
      <Modal isOpen={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} title="Default Payout Settings">
        <form onSubmit={handleSettingsSubmit} className="space-y-5 p-1">
          <p className="text-xs text-[#64748B]">
            Save your primary UPI ID and QR code image so future withdrawal requests are auto-filled.
          </p>

          <div>
            <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Default UPI ID
            </label>
            <input
              type="text"
              value={settingsUpiId}
              onChange={(e) => setSettingsUpiId(e.target.value)}
              placeholder="e.g. yourname@upi"
              className="w-full bg-white border border-[#E2E8F0] rounded-[14px] px-4 py-3 text-[#0F172A] text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF]"
              required
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
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
                  <p className="text-[11px] text-[#64748B]">Auto-attached to withdrawal requests</p>
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
                className="w-full border-2 border-dashed border-[#CBD5E1] hover:border-[#5B4BFF] bg-[#F8FAFC] rounded-[14px] py-4 px-4 text-xs font-bold text-[#64748B] hover:text-[#5B4BFF] transition-colors flex items-center justify-center gap-2"
              >
                <HiUpload className="w-4 h-4" /> Upload Default QR Code Image
              </button>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
            <Button variant="secondary" type="button" onClick={() => setSettingsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={settingsMutation.isPending} className="bg-[#5B4BFF] hover:bg-[#4F3FE8] text-white">
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
