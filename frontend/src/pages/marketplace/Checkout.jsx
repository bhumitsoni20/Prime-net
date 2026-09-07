import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import {
  HiShieldCheck,
  HiLockClosed,
  HiOutlineQrcode,
  HiOutlineDocumentDuplicate,
  HiOutlinePhotograph,
  HiOutlineX,
  HiCreditCard,
  HiPlus,
  HiSparkles,
  HiExclamationCircle,
} from 'react-icons/hi';
import imageCompression from 'browser-image-compression';
import useCart from '../../hooks/useCart';
import useAuthStore from '../../store/authStore';
import { getBuyerWallet, requestTopup } from '../../services/wallet.service';
import api, { apiPost } from '../../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Top Up Modal State inside Checkout
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('100');
  const [topupScreenshotPreview, setTopupScreenshotPreview] = useState(null);
  const [topupScreenshotBase64, setTopupScreenshotBase64] = useState(null);
  const [topupUpiRef, setTopupUpiRef] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const topupFileInputRef = useRef(null);

  const { items: cartItems, total: subtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const bundleId = location.state?.bundleId;

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch Live Buyer Wallet
  const { data: walletData, refetch: refetchWallet } = useQuery({
    queryKey: ['buyerWallet'],
    queryFn: async () => {
      const res = await getBuyerWallet();
      return res.data;
    },
    enabled: !!isAuthenticated,
  });

  const walletBalance = walletData?.walletBalance || 0;

  // Fetch Bundle info if direct bundle checkout
  const { data: bundle } = useQuery({
    queryKey: ['bundle', bundleId],
    queryFn: async () => {
      const res = await api.get(`/bundles/${bundleId}`);
      return res.data;
    },
    enabled: !!bundleId,
  });

  // Fetch Payment Settings
  const { data: settingsRes } = useQuery({
    queryKey: ['paymentSettings'],
    queryFn: async () => {
      const res = await api.get('/payments/settings');
      return res.data;
    },
  });

  const settings = settingsRes || {};
  const cartSubtotal = bundleId && bundle ? bundle.bundlePrice : subtotal;
  const currentSubtotal = appliedCoupon ? appliedCoupon.finalAmount : cartSubtotal;
  const platformFee = currentSubtotal * 0.04;
  const displayTotal = currentSubtotal + platformFee;
  const isFreeOrder = displayTotal <= 0;
  const hasSufficientBalance = isFreeOrder || walletBalance >= displayTotal;
  const deficitAmount = Math.max(0, displayTotal - walletBalance);

  // Set initial topup amount when deficient
  useEffect(() => {
    if (deficitAmount > 0) {
      const recommended = Math.max(30, Math.min(1000, Math.ceil(deficitAmount)));
      setTopupAmount(recommended.toString());
    }
  }, [deficitAmount]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    try {
      setIsApplyingCoupon(true);
      const res = await apiPost('/coupons/validate', {
        couponCode: couponCodeInput,
        cartTotal: bundleId && bundle ? bundle.bundlePrice : subtotal,
      });
      setAppliedCoupon(res.data);
      toast.success('Coupon applied successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
  };

  const handleCopyUpi = () => {
    if (settings.upiId) {
      navigator.clipboard.writeText(settings.upiId);
      toast.success('UPI ID copied to clipboard!');
    }
  };

  const handleTopupFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 12 * 1024 * 1024) {
        toast.error('File size must be under 12MB');
        return;
      }

      try {
        setIsCompressing(true);
        const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1600, useWebWorker: true };
        const compressed = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          setTopupScreenshotPreview(URL.createObjectURL(compressed));
          setTopupScreenshotBase64(reader.result?.toString() || '');
          setIsCompressing(false);
        };
        reader.readAsDataURL(compressed);
      } catch (err) {
        setIsCompressing(false);
        const reader = new FileReader();
        reader.onloadend = () => {
          setTopupScreenshotPreview(URL.createObjectURL(file));
          setTopupScreenshotBase64(reader.result?.toString() || '');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Top Up Mutation
  const topupMutation = useMutation({
    mutationFn: async ({ amount, screenshot, upiReference }) => {
      return await requestTopup({ amount, screenshot, upiReference });
    },
    onSuccess: () => {
      toast.success('Top-up proof submitted! Your balance will be credited upon admin verification.');
      setShowTopupModal(false);
      setTopupScreenshotPreview(null);
      setTopupScreenshotBase64(null);
      setTopupUpiRef('');
      queryClient.invalidateQueries({ queryKey: ['buyerWallet'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to submit top-up request.');
    },
  });

  const handleTopupSubmit = (e) => {
    e.preventDefault();
    const num = Number(topupAmount);
    if (isNaN(num) || num < 30 || num > 1000) {
      return toast.error('Top-up amount must be between ₹30 and ₹1,000');
    }
    if (!topupScreenshotBase64) {
      return toast.error('Please upload your payment screenshot proof');
    }
    topupMutation.mutate({
      amount: num,
      screenshot: topupScreenshotBase64,
      upiReference: topupUpiRef,
    });
  };

  // Instant Checkout with Wallet Balance
  const handleWalletCheckout = async () => {
    if (!bundleId && cartItems.length === 0) return toast.error('Your cart is empty');
    if (!hasSufficientBalance && !isFreeOrder) {
      return setShowTopupModal(true);
    }

    try {
      setIsProcessing(true);
      let createdOrders = [];

      if (bundleId) {
        // Direct Bundle Purchase
        const res = await apiPost('/bundle-orders', {
          bundleId,
          paymentMethod: isFreeOrder ? 'coupon' : 'wallet',
          couponCode: appliedCoupon?.code,
          cartTotal: cartSubtotal,
        });
        createdOrders.push(res.data);
      } else {
        // Mixed Cart Checkout
        const productItems = cartItems.filter((item) => !item.bundlePrice);
        const bundleItems = cartItems.filter((item) => !!item.bundlePrice);

        const productPromises = productItems.map((item) =>
          apiPost('/orders', {
            productId: item._id,
            paymentMethod: isFreeOrder ? 'coupon' : 'wallet',
            couponCode: appliedCoupon?.code,
            cartTotal: cartSubtotal,
          })
        );
        const bundlePromises = bundleItems.map((item) =>
          apiPost('/bundle-orders', {
            bundleId: item._id,
            paymentMethod: isFreeOrder ? 'coupon' : 'wallet',
            couponCode: appliedCoupon?.code,
            cartTotal: cartSubtotal,
          })
        );

        const prodResponses = await Promise.all(productPromises);
        const bundleResponses = await Promise.all(bundlePromises);

        createdOrders = [...prodResponses.map((r) => r.data), ...bundleResponses.map((r) => r.data)];
      }

      clearCart();
      queryClient.invalidateQueries({ queryKey: ['buyerWallet'] });
      toast.success('🎉 Payment successful! Order placed instantly.');

      // Direct to chat or orders
      if (createdOrders.length > 0) {
        const firstOrder = createdOrders[0];
        navigate(`/dashboard/chats/${firstOrder._id}`, { replace: true });
      } else {
        navigate('/dashboard/orders', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete wallet checkout');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-10 pb-5 border-b border-[#F1F5F9]">
        <Link to="/" className="text-[22px] font-extrabold text-[#0F172A] tracking-tight">
          <span className="text-[#5B4BFF]">Stream</span>Kart
        </Link>
        <div className="flex items-center gap-2 text-[#64748B] text-[13px] font-semibold tracking-wide uppercase">
          <HiLockClosed className="w-4 h-4 text-[#5B4BFF]" /> Secure Wallet Checkout
        </div>
        <Link to="/cart" className="text-[14px] text-[#64748B] hover:text-[#0F172A] font-medium transition-colors">
          Return to Cart
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left — Wallet & Payment Status Card */}
        <div className="lg:col-span-7 space-y-6">
          {/* Wallet Balance Status Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 lg:p-10 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                  Payment Method
                </span>
                <h2 className="text-[24px] font-extrabold text-[#0F172A] tracking-[-0.02em] flex items-center gap-2">
                  StreamKart Wallet <HiSparkles className="w-5 h-5 text-[#5B4BFF]" />
                </h2>
              </div>
              <div className="w-12 h-12 rounded-[16px] bg-[#EEF2FF] text-[#5B4BFF] flex items-center justify-center">
                <HiCreditCard className="w-6 h-6" />
              </div>
            </div>

            {/* Wallet Balance Highlight */}
            <div className="p-6 rounded-[20px] bg-[#F8FAFC] border border-[#E2E8F0] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                  Your Available Balance
                </span>
                <span className="text-[32px] font-extrabold text-[#0F172A] tracking-tight">
                  ₹{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard/wallet"
                  className="px-4 py-2 bg-white border border-[#CBD5E1] hover:bg-[#F1F5F9] rounded-xl text-xs font-bold text-[#0F172A] transition-colors"
                >
                  Manage Wallet
                </Link>
                <Button size="sm" onClick={() => setShowTopupModal(true)} className="flex items-center gap-1">
                  <HiPlus className="w-4 h-4" /> Top Up (₹30-₹1k)
                </Button>
              </div>
            </div>

            {/* Insufficient or Sufficient Alert Banner */}
            {!isFreeOrder && (
              <>
                {hasSufficientBalance ? (
                  <div className="p-4 rounded-[16px] bg-[#F0FDF4] border border-[#BBF7D0] flex items-center gap-3 text-[#166534] text-xs font-semibold">
                    <HiShieldCheck className="w-5 h-5 text-[#16A34A] flex-shrink-0" />
                    <span>
                      You have sufficient balance. Clicking "Pay with Wallet" will place your order instantly with instant
                      credential access!
                    </span>
                  </div>
                ) : (
                  <div className="p-4 rounded-[16px] bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-between gap-4 text-[#991B1B] text-xs font-semibold">
                    <div className="flex items-center gap-2.5">
                      <HiExclamationCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0" />
                      <span>
                        Insufficient Balance. You have <strong>₹{walletBalance}</strong>, but need{' '}
                        <strong>₹{displayTotal.toFixed(2)}</strong> (Deficit: ₹{deficitAmount.toFixed(2)}).
                      </span>
                    </div>
                    <button
                      onClick={() => setShowTopupModal(true)}
                      className="px-3.5 py-1.5 bg-[#EF4444] text-white hover:bg-[#DC2626] rounded-lg text-xs font-extrabold transition-colors flex-shrink-0"
                    >
                      Top Up Now
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-[#F1F5F9] text-[12px] text-[#64748B] font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <HiShieldCheck className="w-4 h-4 text-[#22C55E]" /> Instant 1-Click Payment
              </span>
              <span className="flex items-center gap-1.5">
                <HiLockClosed className="w-4 h-4 text-[#5B4BFF]" /> 24-Hr Refund Protected
              </span>
            </div>
          </div>
        </div>

        {/* Right — Order Summary & Action */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 lg:p-10 sticky top-24 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED]" />
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-6">Order Summary</h2>

            {cartItems.length === 0 && !bundleId ? (
              <p className="text-[#94A3B8] text-sm mb-6 pb-6 border-b border-[#F1F5F9]">Your cart is empty.</p>
            ) : (
              <div className="space-y-4 mb-6 pb-6 border-b border-[#F1F5F9]">
                {bundle ? (
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-[10px] bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-center overflow-hidden flex-shrink-0">
                      <span className="text-[#94A3B8] font-extrabold text-xl">{bundle.title?.[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#0F172A] font-bold text-[14px] truncate">{bundle.title}</p>
                    </div>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item._id} className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-[10px] bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.logo || item.thumbnail ? (
                          <img
                            src={item.logo || item.thumbnail}
                            alt={item.title}
                            className="max-h-full max-w-full object-cover p-1.5"
                          />
                        ) : (
                          <span className="text-[#94A3B8] font-extrabold text-xl">{item.title?.[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#0F172A] font-bold text-[14px] truncate">{item.title}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Coupon UI */}
            <div className="mb-6 pb-6 border-b border-[#F1F5F9]">
              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    placeholder="Have a coupon? Enter code"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    className="uppercase flex-1 px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B4BFF] text-[14px]"
                  />
                  <button
                    type="submit"
                    disabled={isApplyingCoupon}
                    className="bg-[#0F172A] hover:bg-[#1E293B] text-white px-5 py-3 rounded-xl font-bold text-xs transition-colors"
                  >
                    {isApplyingCoupon ? '...' : 'Apply'}
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-green-800 flex items-center gap-1">
                      <HiShieldCheck className="w-4 h-4" /> Coupon Applied
                    </p>
                    <p className="text-xs text-green-700 font-medium mt-0.5">{appliedCoupon.code}</p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-sm text-red-500 hover:text-red-700 font-bold px-3 py-1.5 bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Price Calculation */}
            <div className="space-y-3.5 text-[14px] mb-8">
              <div className="flex justify-between text-[#64748B]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#0F172A]">
                  ₹{cartSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>
                    -₹{appliedCoupon.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[#64748B]">
                <span>Platform Fee</span>
                <span className="font-semibold text-[#0F172A]">
                  ₹{platformFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between pt-5 border-t border-[#F1F5F9] items-baseline">
                <span className="text-[#0F172A] font-bold text-[16px]">Total Payable</span>
                <div className="text-right">
                  <p className="text-[#0F172A] font-extrabold text-[30px] tracking-[-0.02em] leading-none mb-1">
                    ₹{displayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[#94A3B8] text-[10px] font-bold tracking-[0.08em]">BILLED FROM WALLET</p>
                </div>
              </div>
            </div>

            {/* Pay with Wallet Button */}
            <Button
              size="lg"
              className={`w-full py-4 text-[15px] font-extrabold shadow-[0_4px_14px_rgba(91,75,255,0.4)] ${
                !hasSufficientBalance && !isFreeOrder ? '!bg-[#F59E0B] !hover:bg-[#D97706]' : ''
              }`}
              onClick={handleWalletCheckout}
              disabled={isProcessing}
              loading={isProcessing}
            >
              {isFreeOrder
                ? 'Complete Free Order'
                : hasSufficientBalance
                ? `Pay ₹${displayTotal.toFixed(2)} with Wallet`
                : `Top Up Wallet (Need ₹${deficitAmount.toFixed(2)})`}
            </Button>

            <p className="text-[12px] text-[#94A3B8] text-center leading-relaxed mt-4">
              Instant delivery upon payment confirmation. Protected by 24-hr refund policy.
            </p>
          </div>
        </div>
      </div>

      {/* TOP UP MODAL (Inside Checkout) */}
      <Modal
        isOpen={showTopupModal}
        onClose={() => !topupMutation.isPending && setShowTopupModal(false)}
        title="Top Up StreamKart Wallet"
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
                form="checkout-topup-form"
                loading={topupMutation.isPending || isCompressing}
                disabled={!topupScreenshotBase64 || topupMutation.isPending || isCompressing}
                className="px-5 shadow-sm"
              >
                Submit Top-Up Proof
              </Button>
            </div>
          </div>
        }
      >
        <form id="checkout-topup-form" onSubmit={handleTopupSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Column: Amount & UPI QR / Info */}
            <div className="space-y-4">
              {/* Amount input */}
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
                    className="w-full bg-white border border-[#CBD5E1] rounded-[14px] pl-9 pr-4 py-2 text-[18px] font-extrabold text-[#0F172A] focus:border-[#5B4BFF] outline-none"
                  />
                </div>
              </div>

              {/* QR and UPI */}
              <div className="p-4 rounded-[18px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider">Scan & Pay via UPI</h4>
                  <span className="text-[10px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full">Official UPI</span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="bg-white p-2 rounded-[14px] border border-[#E2E8F0] shadow-xs flex-shrink-0">
                    {settings?.qrCode ? (
                      <img src={settings.qrCode} alt="QR" className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg" />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#F1F5F9] rounded-lg flex items-center justify-center text-[#94A3B8]">
                        <HiOutlineQrcode className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">UPI ID</span>
                      <code className="bg-white px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-[#5B4BFF] font-bold text-[11px] block truncate">
                        {settings?.upiId || 'streamkart@upi'}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="text-xs font-bold text-[#0F172A] hover:text-[#5B4BFF] flex items-center gap-1"
                    >
                      <HiOutlineDocumentDuplicate className="w-3.5 h-3.5" /> Copy UPI ID
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Screenshot upload & UTR */}
            <div className="space-y-3.5">
              {/* Screenshot Proof */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-[#334155] uppercase tracking-wider">
                    Payment Screenshot Proof <span className="text-red-500">*</span>
                  </label>
                  {topupScreenshotPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setTopupScreenshotPreview(null);
                        setTopupScreenshotBase64(null);
                        if (topupFileInputRef.current) topupFileInputRef.current.value = '';
                      }}
                      className="text-[11px] font-semibold text-red-500 hover:text-red-700 transition-colors flex items-center gap-0.5"
                    >
                      <HiOutlineX className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                {!topupScreenshotPreview ? (
                  <div
                    onClick={() => topupFileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#CBD5E1] rounded-[18px] bg-[#F8FAFC] p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#F1F5F9] hover:border-[#5B4BFF] transition-all min-h-[135px]"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#EEF2FF] text-[#5B4BFF] flex items-center justify-center mb-1.5">
                      <HiOutlinePhotograph className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-[#334155]">Click to upload payment screenshot</p>
                    <p className="text-[10px] text-[#64748B] mt-0.5">JPG, PNG, WebP up to 12MB</p>
                  </div>
                ) : (
                  <div className="relative border border-[#E2E8F0] rounded-[18px] overflow-hidden bg-[#F8FAFC] p-3 flex flex-col items-center justify-center min-h-[135px]">
                    <img src={topupScreenshotPreview} alt="Proof" className="max-h-28 w-auto object-contain rounded-lg bg-white shadow-xs border border-[#E2E8F0]" />
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-[#16A34A]">
                      <HiShieldCheck className="w-4 h-4" /> Screenshot Attached
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  ref={topupFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleTopupFileChange}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#334155] uppercase tracking-wider mb-1">
                  UPI Ref / UTR (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 423891002341 (12-digit UTR)"
                  value={topupUpiRef}
                  onChange={(e) => setTopupUpiRef(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-[12px] px-3.5 py-2 text-[12px] font-semibold text-[#0F172A] focus:bg-white focus:border-[#5B4BFF] outline-none transition-all"
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
    </div>
  );
};

export default Checkout;
