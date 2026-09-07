import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Button from '../../components/ui/Button';
import { HiCheckCircle, HiOutlineClock } from 'react-icons/hi';
import { getOrder } from '../../services/order.service';
import { apiGet } from '../../services/api';

const PaymentVerificationPending = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const stateOrderIds = location.state?.orderIds || [];

  // Poll for order status if specific order IDs are provided in location.state
  const { data: specificOrders } = useQuery({
    queryKey: ['paymentVerificationStatus', stateOrderIds],
    queryFn: async () => {
      if (stateOrderIds.length === 0) return null;
      const promises = stateOrderIds.map((id) => getOrder(id));
      const results = await Promise.all(promises);
      return results.map((r) => r?.data).filter(Boolean);
    },
    refetchInterval: 3000,
    enabled: stateOrderIds.length > 0,
  });

  // If no stateOrderIds (e.g. visited directly or browser back button), check if user has active pending orders
  const { data: userOrders } = useQuery({
    queryKey: ['checkActivePendingOrders'],
    queryFn: async () => {
      const res = await apiGet('/orders?limit=10');
      return Array.isArray(res) ? res : (res?.data || []);
    },
    enabled: stateOrderIds.length === 0,
  });

  useEffect(() => {
    // 1. If specific order IDs were passed: check if ALL are already verified/completed
    if (stateOrderIds.length > 0 && specificOrders && specificOrders.length > 0) {
      const allVerifiedOrCompleted = specificOrders.every(
        (order) =>
          order.paymentStatus === 'payment_verified' ||
          order.paymentStatus === 'paid' ||
          order.orderStatus === 'completed'
      );

      if (allVerifiedOrCompleted) {
        const verifiedOrder = specificOrders[0];
        navigate(`/dashboard/chats/${verifiedOrder._id}`, { replace: true });
      }
    }

    // 2. If NO order IDs in state (e.g. customer pressed Back after everything was completed)
    if (stateOrderIds.length === 0 && userOrders) {
      const hasAnyPending = userOrders.some(
        (order) =>
          order.paymentStatus === 'in_review' ||
          order.paymentStatus === 'pending_verification'
      );

      if (!hasAnyPending) {
        // Customer has no pending verification orders -> redirect away so they don't see this page again
        navigate('/dashboard/orders', { replace: true });
      }
    }
  }, [stateOrderIds, specificOrders, userOrders, navigate]);

  // Track order IDs in localStorage for global push/socket handler
  useEffect(() => {
    if (stateOrderIds.length > 0) {
      try {
        const existing = JSON.parse(localStorage.getItem('streamkart_pending_orders') || '[]');
        const updated = [...new Set([...existing, ...stateOrderIds.map((id) => id.toString())])];
        localStorage.setItem('streamkart_pending_orders', JSON.stringify(updated));
      } catch (e) {}
    }
  }, [stateOrderIds]);

  const cacheKey = `paymentVerificationStart_${stateOrderIds.join(',') || 'pending'}`;

  useEffect(() => {
    const savedTime = localStorage.getItem(cacheKey);
    if (savedTime) {
      const elapsed = Math.floor((Date.now() - parseInt(savedTime)) / 1000);
      const remaining = Math.max(300 - elapsed, 0);
      setTimeLeft(remaining);
    } else {
      localStorage.setItem(cacheKey, Date.now().toString());
      setTimeLeft(300);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cacheKey]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-[24px] border border-[#E2E8F0] shadow-xl">
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75" />
          <div className="relative flex items-center justify-center w-24 h-24 bg-white rounded-full border-4 border-blue-500 shadow-lg">
            <HiCheckCircle className="w-14 h-14 text-blue-500" />
          </div>
        </div>

        <div>
          <h2 className="text-[28px] font-extrabold text-[#0F172A] mb-2 tracking-tight">Proof Submitted!</h2>
          <p className="text-[15px] text-[#64748B] font-medium leading-relaxed">
            Your payment proof has been submitted successfully. It is currently being reviewed by our admin team.
          </p>
        </div>

        <div className="bg-[#F8FAFC] rounded-[16px] p-6 border border-[#E2E8F0]">
          <div className="flex items-center justify-center gap-2 mb-2 text-[#64748B] font-bold text-[13px] uppercase tracking-wider">
            <HiOutlineClock className="w-5 h-5 text-[#5B4BFF]" /> Estimated Time
          </div>
          <div className="text-[36px] font-extrabold text-[#0F172A] tracking-[-0.02em] font-mono">
            {formatTime(timeLeft)}
          </div>
          {timeLeft === 0 ? (
            <p className="text-[#F59E0B] font-semibold text-[14px] mt-2">
              Your payment is still being reviewed. We will notify you once verification is complete.
            </p>
          ) : (
            <p className="text-[#64748B] font-medium text-[13px] mt-2">
              Please wait while we manually verify your transaction.
            </p>
          )}
        </div>

        <div className="space-y-3 pt-4 border-t border-[#F1F5F9]">
          <Button onClick={() => navigate('/dashboard/orders')} size="lg" className="w-full">
            View My Orders
          </Button>
          <Button onClick={() => navigate('/')} variant="secondary" size="lg" className="w-full">
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerificationPending;
