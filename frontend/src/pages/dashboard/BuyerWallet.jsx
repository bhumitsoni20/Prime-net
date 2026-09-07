import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiCreditCard,
  HiPlus,
  HiArrowSmUp,
  HiArrowSmDown,
  HiShieldCheck,
  HiClock,
  HiOutlineDocumentDuplicate,
  HiOutlineQrcode,
  HiOutlinePhotograph,
  HiX,
  HiCheckCircle,
  HiExclamationCircle,
  HiShoppingBag,
  HiOutlineRefresh,
  HiSparkles,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { getBuyerWallet, requestTopup, requestWithdrawal } from '../../services/wallet.service';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import { useSocket } from '../../context/SocketContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const BuyerWallet = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { socket } = useSocket();

  const [activeTab, setActiveTab] = useState('all');
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Top-Up Form State
  const [topupAmount, setTopupAmount] = useState('100');
  const [upiRefInput, setUpiRefInput] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotBase64, setScreenshotBase64] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawUpiId, setWithdrawUpiId] = useState('');
  const [withdrawName, setWithdrawName] = useState(user?.name || '');

  // Fetch Live Buyer Wallet Data
  const { data: walletData, isLoading, refetch } = useQuery({
    queryKey: ['buyerWallet'],
    queryFn: async () => {
      const res = await getBuyerWallet();
      return res.data;
    },
    refetchInterval: 30000,
  });

  // Fetch Payment Settings (QR and UPI ID)
  const { data: paymentSettings } = useQuery({
    queryKey: ['paymentSettings'],
    queryFn: async () => {
      const res = await api.get('/payments/settings');
      return res.data;
    },
  });

  // Real-time socket updates for wallet events
  useEffect(() => {
    if (!socket) return;

    const handleWalletUpdate = (payload) => {
      queryClient.invalidateQueries({ queryKey: ['buyerWallet'] });
      if (payload.reason === 'topup_approved') {
        toast.success(`🎉 ₹${payload.change} credited to your wallet!`);
      } else if (payload.reason === 'refund_rejected_reversal') {
        toast('Refund request rejected: funds restored to wallet.', { icon: 'ℹ️' });
      }
    };

    const handleTopupApproved = (data) => {
      queryClient.invalidateQueries({ queryKey: ['buyerWallet'] });
      toast.success(`Top-up of ₹${data.amount} approved! New balance: ₹${data.newBalance}`);
    };

    const handleTopupRejected = (data) => {
      queryClient.invalidateQueries({ queryKey: ['buyerWallet'] });
      toast.error(`Top-up of ₹${data.amount} was rejected: ${data.rejectionReason}`);
    };

    const handleRefundApproved = (data) => {
      queryClient.invalidateQueries({ queryKey: ['buyerWallet'] });
      toast.success(`Refund of ₹${data.amount} sent to your UPI (${data.upiId})!`);
    };

    const handleRefundRejected = (data) => {
      queryClient.invalidateQueries({ queryKey: ['buyerWallet'] });
      toast.error(`Refund of ₹${data.amount} rejected. Funds credited back to wallet.`);
    };

    socket.on('wallet_updated', handleWalletUpdate);
    socket.on('wallet_topup_approved', handleTopupApproved);
    socket.on('wallet_topup_rejected', handleTopupRejected);
    socket.on('buyer_refund_approved', handleRefundApproved);
    socket.on('buyer_refund_rejected', handleRefundRejected);

    return () => {
      socket.off('wallet_updated', handleWalletUpdate);
      socket.off('wallet_topup_approved', handleTopupApproved);
      socket.off('wallet_topup_rejected', handleTopupRejected);
      socket.off('buyer_refund_approved', handleRefundApproved);
      socket.off('buyer_refund_rejected', handleRefundRejected);
    };
  }, [socket, queryClient]);

  // Top-Up Mutation
  const topupMutation = useMutation({
    mutationFn: async ({ amount, screenshot, upiReference }) => {
      return await requestTopup({ amount, screenshot, upiReference });
    },
    onSuccess: () => {
      toast.success('Top-up proof submitted! We will verify and credit your balance shortly.');
      setShowTopupModal(false);
      setScreenshotPreview(null);
      setScreenshotBase64(null);
      setUpiRefInput('');
      setTopupAmount('100');
      queryClient.invalidateQueries({ queryKey: ['buyerWallet'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to submit top-up request.');
    },
  });

  // Withdrawal Mutation
  const withdrawMutation = useMutation({
    mutationFn: async ({ amount, upiId, beneficiaryName }) => {
      return await requestWithdrawal({ amount, upiId, beneficiaryName });
    },
    onSuccess: () => {
      toast.success('Refund request submitted! It will be processed to your UPI within 24 hours.');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawUpiId('');
      queryClient.invalidateQueries({ queryKey: ['buyerWallet'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to request withdrawal.');
    },
  });

  const handleCopyUpi = () => {
    if (paymentSettings?.upiId) {
      navigator.clipboard.writeText(paymentSettings.upiId);
      toast.success('UPI ID copied to clipboard!');
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 12 * 1024 * 1024) {
        toast.error('File size must be under 12MB');
        return;
      }

      try {
        setIsCompressing(true);
        const options = {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          setScreenshotPreview(URL.createObjectURL(compressedFile));
          setScreenshotBase64(reader.result?.toString() || '');
          setIsCompressing(false);
        };
        reader.readAsDataURL(compressedFile);
      } catch (err) {
        console.error('Compression error:', err);
        setIsCompressing(false);
        // Fallback to original
        const reader = new FileReader();
        reader.onloadend = () => {
          setScreenshotPreview(URL.createObjectURL(file));
          setScreenshotBase64(reader.result?.toString() || '');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleTopupSubmit = (e) => {
    e.preventDefault();
    const num = Number(topupAmount);
    if (isNaN(num) || num < 30 || num > 1000) {
      return toast.error('Top-up amount must be between ₹30 and ₹1,000');
    }
    if (!screenshotBase64) {
      return toast.error('Please upload your payment screenshot proof');
    }
    topupMutation.mutate({
      amount: num,
      screenshot: screenshotBase64,
      upiReference: upiRefInput,
    });
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const num = Number(withdrawAmount);
    const balance = walletData?.walletBalance || 0;

    if (isNaN(num) || num <= 0) {
      return toast.error('Please enter a valid withdrawal amount');
    }
    if (num > balance) {
      return toast.error(`Insufficient balance. You can withdraw up to ₹${balance}`);
    }
    if (!withdrawUpiId.trim() || !withdrawUpiId.includes('@')) {
      return toast.error('Please enter a valid UPI ID (e.g. name@okhdfcbank)');
    }

    withdrawMutation.mutate({
      amount: num,
      upiId: withdrawUpiId.trim(),
      beneficiaryName: withdrawName.trim(),
    });
  };

  const stats = walletData?.stats || {
    availableBalance: 0,
    totalTopup: 0,
    pendingTopup: 0,
    totalSpent: 0,
    totalWithdrawn: 0,
    pendingWithdrawal: 0,
  };

  const activity = walletData?.activity || [];
  const filteredActivity = activity.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'topups') return item.type === 'topup';
    if (activeTab === 'purchases') return item.type === 'purchase';
    if (activeTab === 'withdrawals') return item.type === 'withdrawal';
    return true;
  });

  const presetAmounts = [50, 100, 250, 500, 1000];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em] flex items-center gap-2.5">
            StreamKart Wallet <HiSparkles className="w-6 h-6 text-[#5B4BFF]" />
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Add funds, complete instant 1-click checkouts, or request a 24-hour UPI refund anytime.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="self-start sm:self-auto p-2.5 bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] text-[#64748B] transition-colors flex items-center gap-2 text-xs font-bold shadow-xs"
        >
          <HiOutlineRefresh className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Balance & Action Hero Card */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-white p-8 sm:p-10 shadow-[0_20px_50px_-12px_rgba(91,75,255,0.25)] border border-white/10">
        {/* Decorative Background Elements */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-[#5B4BFF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 top-0 w-64 h-64 bg-[#7C3AED]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[12px] font-bold text-[#A5B4FC]">
              <HiCreditCard className="w-4 h-4 text-[#818CF8]" /> Available Balance
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[44px] sm:text-[52px] font-extrabold tracking-tight leading-none">
                ₹{isLoading ? '...' : (walletData?.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-white/60 text-xs font-bold uppercase tracking-wider">INR</span>
            </div>
            <p className="text-white/70 text-xs sm:text-sm font-medium">
              Seamlessly used across all digital subscriptions & bundles with instant delivery.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              size="lg"
              onClick={() => setShowTopupModal(true)}
              className="px-7 py-4 rounded-[16px] bg-[#5B4BFF] hover:bg-[#4F3FE8] text-white font-extrabold text-[15px] shadow-[0_10px_25px_rgba(91,75,255,0.4)] flex items-center justify-center gap-2 border border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <HiPlus className="w-5 h-5 stroke-[2.5]" /> Add Money
            </Button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={(walletData?.walletBalance || 0) <= 0}
              className="px-6 py-4 rounded-[16px] bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:hover:bg-white/10 backdrop-blur-md text-white font-bold text-[14px] border border-white/15 transition-all flex items-center justify-center gap-2"
            >
              <HiArrowSmUp className="w-5 h-5 text-[#34D399]" /> Withdraw / Refund
            </button>
          </div>
        </div>

        {/* Mini Quick Stats Bar */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 text-xs">
          <div>
            <span className="text-white/60 block font-semibold mb-1">Total Added</span>
            <span className="text-[16px] font-bold text-white">₹{stats.totalTopup.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-white/60 block font-semibold mb-1">Total Spent</span>
            <span className="text-[16px] font-bold text-white">₹{stats.totalSpent.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-white/60 block font-semibold mb-1">Pending Top-Ups</span>
            <span className={`text-[16px] font-bold ${stats.pendingTopup > 0 ? 'text-[#FBBF24]' : 'text-white'}`}>
              ₹{stats.pendingTopup.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-white/60 block font-semibold mb-1">Refunds Processed</span>
            <span className="text-[16px] font-bold text-[#34D399]">₹{stats.totalWithdrawn.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 24-Hr Refund Guarantee Notice Banner */}
      <div className="p-4 sm:p-5 rounded-[20px] bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-[12px] bg-[#5B4BFF] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <HiShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-[#1E1B4B]">100% Buyer Protection & 24-Hour Refund Guarantee</h4>
            <p className="text-[12px] text-[#4338CA] leading-relaxed">
              Unused wallet balance can be withdrawn to your UPI ID at any time. All refund requests are guaranteed to be processed within 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] shadow-sm overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[20px] font-extrabold text-[#0F172A] tracking-[-0.01em]">Wallet Activity</h2>
            <p className="text-[#64748B] text-xs sm:text-sm mt-0.5">Top-up history, purchase debits, and withdrawal transactions.</p>
          </div>

          <div className="flex bg-[#F1F5F9] p-1 rounded-xl self-start sm:self-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'topups', label: 'Top-Ups' },
              { id: 'purchases', label: 'Purchases' },
              { id: 'withdrawals', label: 'Refunds' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id ? 'bg-white text-[#0F172A] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity List */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : filteredActivity.length === 0 ? (
          <div className="py-16 text-center bg-[#F8FAFC] rounded-[18px] border border-[#F1F5F9]">
            <div className="w-14 h-14 bg-[#EEF2FF] text-[#5B4BFF] rounded-full flex items-center justify-center mx-auto mb-3">
              <HiCreditCard className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">No wallet activity yet</h3>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-sm mx-auto mb-5">
              Add money to your wallet to start purchasing premium subscriptions instantly with 1-click checkout.
            </p>
            <Button size="sm" onClick={() => setShowTopupModal(true)}>
              <HiPlus className="w-4 h-4 mr-1" /> Add Money (Min ₹30)
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {filteredActivity.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors rounded-xl px-2">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 ${
                      item.type === 'topup'
                        ? 'bg-[#DCFCE7] text-[#16A34A]'
                        : item.type === 'withdrawal'
                        ? 'bg-[#FEF3C7] text-[#D97706]'
                        : 'bg-[#EEF2FF] text-[#5B4BFF]'
                    }`}
                  >
                    {item.type === 'topup' && <HiArrowSmDown className="w-6 h-6" />}
                    {item.type === 'withdrawal' && <HiArrowSmUp className="w-6 h-6" />}
                    {item.type === 'purchase' && <HiShoppingBag className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#0F172A] truncate">{item.title}</p>
                    <p className="text-[12px] text-[#64748B] truncate mt-0.5">{item.description}</p>
                    <span className="text-[11px] text-[#94A3B8] font-semibold block mt-0.5">
                      {dayjs(item.createdAt).format('MMM D, YYYY • h:mm A')}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
                  <span
                    className={`text-[15px] font-extrabold ${
                      item.isCredit ? 'text-[#16A34A]' : 'text-[#0F172A]'
                    }`}
                  >
                    {item.isCredit ? '+' : '-'}₹{item.amount.toLocaleString()}
                  </span>

                  {/* Status Badge */}
                  {item.status === 'completed' || item.status === 'delivered' ? (
                    <span className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full">Completed</span>
                  ) : item.status === 'pending_verification' || item.status === 'pending' || item.status === 'placed' ? (
                    <span className="text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <HiClock className="w-3 h-3" /> Pending
                    </span>
                  ) : item.status === 'rejected' ? (
                    <span className="text-[10px] font-bold text-[#EF4444] bg-[#FEE2E2] px-2 py-0.5 rounded-full" title={item.rejectionReason}>
                      Rejected
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">{item.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TOP-UP MODAL (₹30 Min - ₹1,000 Max) */}
      <Modal
        isOpen={showTopupModal}
        onClose={() => !topupMutation.isPending && setShowTopupModal(false)}
        title="Add Money to Wallet"
        subtitle="Transfer funds to official UPI, upload screenshot proof, and get verified."
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#64748B]">Adding:</span>
              <span className="text-[14px] font-extrabold text-[#0F172A] bg-white px-2.5 py-0.5 rounded-lg border border-[#E2E8F0]">
                ₹{Number(topupAmount) || 0}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowTopupModal(false)}
                disabled={topupMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="topup-form"
                loading={topupMutation.isPending || isCompressing}
                disabled={!screenshotBase64 || topupMutation.isPending || isCompressing}
                className="px-5 shadow-sm"
              >
                Submit Proof for Verification
              </Button>
            </div>
          </div>
        }
      >
        <form id="topup-form" onSubmit={handleTopupSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Column: Amount & UPI QR / Info */}
            <div className="space-y-4">
              {/* Amount input & preset chips */}
              <div className="p-4 rounded-[18px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#334155] uppercase tracking-wider">
                    Enter Amount
                  </label>
                  <span className="text-[10px] font-bold text-[#5B4BFF] bg-[#EEF2FF] px-2 py-0.5 rounded-full">
                    Min ₹30 • Max ₹1,000
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] font-extrabold text-[#64748B]">₹</span>
                  <input
                    type="number"
                    min="30"
                    max="1000"
                    required
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="100"
                    className="w-full bg-white border border-[#CBD5E1] rounded-[14px] pl-9 pr-4 py-2 text-[18px] font-extrabold text-[#0F172A] focus:border-[#5B4BFF] focus:ring-[3px] focus:ring-[#5B4BFF]/10 outline-none transition-all"
                  />
                </div>

                {/* Quick preset chips */}
                <div className="flex flex-wrap gap-1.5">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupAmount(amt.toString())}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                        topupAmount === amt.toString()
                          ? 'bg-[#5B4BFF] text-white border-[#5B4BFF] shadow-xs'
                          : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Details (UPI QR & ID) */}
              <div className="p-4 rounded-[18px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider">Step 1: Scan & Pay</h4>
                  <span className="text-[10px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full">Official UPI</span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="bg-white p-2 rounded-[14px] border border-[#E2E8F0] shadow-xs flex-shrink-0">
                    {paymentSettings?.qrCode ? (
                      <img src={paymentSettings.qrCode} alt="Payment QR" className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg" />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#F1F5F9] rounded-lg flex items-center justify-center text-[#94A3B8]">
                        <HiOutlineQrcode className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div>
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">UPI ID</span>
                      <div className="flex items-center">
                        <code className="bg-white px-2.5 py-1.5 rounded-l-lg border border-[#E2E8F0] border-r-0 text-[#5B4BFF] font-bold text-[11px] flex-1 truncate">
                          {paymentSettings?.upiId || 'streamkart@upi'}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="bg-[#0F172A] text-white px-2.5 py-1.5 rounded-r-lg font-bold text-[11px] hover:bg-[#1E293B] transition-colors flex items-center gap-1 flex-shrink-0"
                        >
                          <HiOutlineDocumentDuplicate className="w-3.5 h-3.5" /> Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">Payee Name</span>
                      <span className="text-[12px] font-bold text-[#0F172A] truncate block">{paymentSettings?.accountName || 'StreamKart Official'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Screenshot upload & UTR */}
            <div className="space-y-3.5">
              {/* Screenshot Upload Dropzone */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-[#334155] uppercase tracking-wider">
                    Step 2: Upload Proof <span className="text-red-500">*</span>
                  </label>
                  {screenshotPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotPreview(null);
                        setScreenshotBase64(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-[11px] font-semibold text-red-500 hover:text-red-700 transition-colors flex items-center gap-0.5"
                    >
                      <HiX className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                {!screenshotPreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#CBD5E1] rounded-[18px] bg-[#F8FAFC] p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#F1F5F9] hover:border-[#5B4BFF] transition-all min-h-[135px]"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#EEF2FF] text-[#5B4BFF] flex items-center justify-center mb-1.5">
                      <HiOutlinePhotograph className="w-5 h-5" />
                    </div>
                    <p className="text-[12px] font-bold text-[#0F172A]">Click to upload payment screenshot</p>
                    <p className="text-[10px] font-medium text-[#64748B] mt-0.5">PNG, JPG, WebP up to 12MB</p>
                  </div>
                ) : (
                  <div className="relative border border-[#E2E8F0] rounded-[18px] overflow-hidden bg-[#F8FAFC] p-3 flex flex-col items-center justify-center min-h-[135px]">
                    <img
                      src={screenshotPreview}
                      alt="Proof Preview"
                      className="max-h-28 w-auto object-contain rounded-lg bg-white shadow-xs border border-[#E2E8F0]"
                    />
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-[#16A34A]">
                      <HiShieldCheck className="w-4 h-4" /> Screenshot Attached
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Optional UPI Ref Input */}
              <div>
                <label className="block text-[11px] font-bold text-[#334155] uppercase tracking-wider mb-1">
                  UPI Reference / UTR Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 423891002341 (12-digit UTR)"
                  value={upiRefInput}
                  onChange={(e) => setUpiRefInput(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-[12px] px-3.5 py-2 text-[12px] font-semibold text-[#0F172A] focus:bg-white focus:border-[#5B4BFF] focus:ring-[3px] focus:ring-[#5B4BFF]/10 outline-none transition-all"
                />
              </div>

              <div className="p-2.5 rounded-[12px] bg-[#EEF2FF] border border-[#C7D2FE] text-[11px] text-[#4338CA] flex items-center gap-2">
                <HiShieldCheck className="w-4 h-4 text-[#5B4BFF] flex-shrink-0" />
                <span>Admin verifies top-ups quickly. Guaranteed 24-hr refund policy.</span>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* WITHDRAWAL / REFUND MODAL (24-Hour SLA) */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => !withdrawMutation.isPending && setShowWithdrawModal(false)}
        title="Withdraw / Refund Funds"
        subtitle="Request a refund to your UPI ID with our guaranteed 24-hour SLA."
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#64748B]">Refund:</span>
              <span className="text-[14px] font-extrabold text-[#0F172A] bg-white px-2.5 py-0.5 rounded-lg border border-[#E2E8F0]">
                ₹{Number(withdrawAmount) || 0}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowWithdrawModal(false)}
                disabled={withdrawMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="withdraw-form"
                loading={withdrawMutation.isPending}
                disabled={withdrawMutation.isPending || !withdrawAmount || !withdrawUpiId}
                className="px-5 shadow-sm"
              >
                Request 24-Hr Refund
              </Button>
            </div>
          </div>
        }
      >
        <form id="withdraw-form" onSubmit={handleWithdrawSubmit} className="space-y-4">
          <div className="p-3.5 rounded-[16px] bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs font-semibold flex items-center gap-2.5">
            <HiClock className="w-5 h-5 flex-shrink-0 text-[#D97706]" />
            <span>⚡ 24-Hour SLA Guarantee: Refunded directly to your UPI ID within 24 hours.</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-[#334155] uppercase tracking-wider">
                Withdrawal Amount
              </label>
              <span className="text-[11px] text-[#64748B] font-medium">
                Available: <strong className="text-[#0F172A]">₹{(walletData?.walletBalance || 0).toLocaleString()}</strong>
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] font-extrabold text-[#64748B]">₹</span>
              <input
                type="number"
                min="1"
                max={walletData?.walletBalance || 0}
                required
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-[14px] pl-9 pr-16 py-2.5 text-[18px] font-extrabold text-[#0F172A] focus:bg-white focus:border-[#5B4BFF] focus:ring-[3px] focus:ring-[#5B4BFF]/10 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setWithdrawAmount((walletData?.walletBalance || 0).toString())}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#EEF2FF] text-[#5B4BFF] hover:bg-[#E0E7FF] rounded-lg text-xs font-bold transition-colors"
              >
                Max
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#334155] uppercase tracking-wider mb-1.5">
              Your UPI ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
              required
              value={withdrawUpiId}
              onChange={(e) => setWithdrawUpiId(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-[14px] px-3.5 py-2.5 text-[13px] font-semibold text-[#0F172A] focus:bg-white focus:border-[#5B4BFF] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#334155] uppercase tracking-wider mb-1.5">
              Beneficiary / Account Name
            </label>
            <input
              type="text"
              placeholder="Your full name"
              value={withdrawName}
              onChange={(e) => setWithdrawName(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-[14px] px-3.5 py-2.5 text-[13px] font-semibold text-[#0F172A] focus:bg-white focus:border-[#5B4BFF] outline-none transition-all"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BuyerWallet;
