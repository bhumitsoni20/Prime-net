import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { HiCheckCircle, HiXCircle, HiArrowRight, HiChatAlt2 } from 'react-icons/hi';
import { useSocket } from '../context/SocketContext';
import useAuthStore from '../store/authStore';
import { getMyOrders } from '../services/order.service';
import Button from './ui/Button';

const PENDING_ORDERS_KEY = 'streamkart_pending_orders';

const PaymentApprovalHandler = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { socket } = useSocket();

  const [redirectData, setRedirectData] = useState(null);
  const [rejectionData, setRejectionData] = useState(null);
  const [countdown, setCountdown] = useState(3);

  const getTrackedPendingCount = () => {
    try {
      const pending = JSON.parse(localStorage.getItem(PENDING_ORDERS_KEY) || '[]');
      return Array.isArray(pending) ? pending.length : 0;
    } catch (e) {
      return 0;
    }
  };

  // 1. Listen via WebSockets (Instant real-time update)
  useEffect(() => {
    if (!socket || typeof socket.on !== 'function' || !user) return;

    const handlePaymentVerified = (data) => {
      const orderId = data?.orderId || data?._id;
      const targetUserId = data?.userId;

      if (targetUserId && targetUserId !== user._id?.toString()) return;

      if (orderId) {
        try {
          const tracked = JSON.parse(localStorage.getItem(PENDING_ORDERS_KEY) || '[]');
          const updated = tracked.filter((id) => id !== orderId.toString());
          localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(updated));
        } catch (e) {}

        setRedirectData({ orderId });
        setCountdown(3);
      }
    };

    const handlePaymentRejected = (data) => {
      const orderId = data?.orderId || data?._id;
      const targetUserId = data?.userId || data?.buyerId;

      if (targetUserId && targetUserId !== user._id?.toString()) return;

      if (orderId) {
        try {
          const tracked = JSON.parse(localStorage.getItem(PENDING_ORDERS_KEY) || '[]');
          const updated = tracked.filter((id) => id !== orderId.toString());
          localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(updated));
        } catch (e) {}

        setRejectionData(data);
      }
    };

    socket.on('payment_verified_redirect', handlePaymentVerified);
    socket.on('payment_rejected_popup', handlePaymentRejected);

    return () => {
      if (typeof socket.off === 'function') {
        socket.off('payment_verified_redirect', handlePaymentVerified);
        socket.off('payment_rejected_popup', handlePaymentRejected);
      }
    };
  }, [socket, user]);

  // 2. Fallback: Only poll if user is logged in AND has pending orders tracked
  useQuery({
    queryKey: ['pendingOrdersCheck'],
    queryFn: async () => {
      try {
        const res = await getMyOrders('limit=10');
        const orders = Array.isArray(res) ? res : res?.data || [];

        let trackedPending = [];
        try {
          trackedPending = JSON.parse(localStorage.getItem(PENDING_ORDERS_KEY) || '[]');
        } catch (e) {
          trackedPending = [];
        }

        const currentPending = [];
        let freshlyVerifiedOrderId = null;
        let freshlyRejectedOrder = null;

        orders.forEach((order) => {
          const orderIdStr = order._id?.toString();
          const isPending = order.paymentStatus === 'in_review' || order.paymentStatus === 'pending_verification';
          const isVerified = order.paymentStatus === 'payment_verified' || order.paymentStatus === 'paid';
          const isRejected = order.paymentStatus === 'payment_rejected';

          if (isPending) {
            currentPending.push(orderIdStr);
          } else if (isVerified && trackedPending.includes(orderIdStr)) {
            freshlyVerifiedOrderId = orderIdStr;
          } else if (isRejected && trackedPending.includes(orderIdStr)) {
            freshlyRejectedOrder = {
              orderId: orderIdStr,
              rejectionReason: order.rejectionReason || 'Payment proof was not clear or invalid',
              productName: order.product?.title || order.bundle?.title || 'Product',
              orderType: order.isBundle ? 'BundleOrder' : 'Order',
            };
          }
        });

        localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(currentPending));

        if (freshlyVerifiedOrderId && !redirectData) {
          const updatedPending = currentPending.filter((id) => id !== freshlyVerifiedOrderId);
          localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(updatedPending));

          setRedirectData({ orderId: freshlyVerifiedOrderId });
          setCountdown(3);
        } else if (freshlyRejectedOrder && !rejectionData && !redirectData) {
          const updatedPending = currentPending.filter((id) => id !== freshlyRejectedOrder.orderId);
          localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(updatedPending));

          setRejectionData(freshlyRejectedOrder);
        }

        return currentPending;
      } catch (err) {
        return [];
      }
    },
    refetchInterval: () => {
      if (!token || redirectData) return false;
      return getTrackedPendingCount() > 0 ? 5000 : false;
    },
    enabled: !!token && !redirectData && getTrackedPendingCount() > 0,
    retry: false,
  });

  // 3. Countdown & Redirect Logic
  useEffect(() => {
    if (redirectData && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (redirectData && countdown === 0) {
      handleImmediateRedirect();
    }
  }, [redirectData, countdown]);

  const handleImmediateRedirect = () => {
    const orderId = redirectData?.orderId;
    if (orderId) {
      setTimeout(() => {
        setRedirectData(null);
        navigate(`/dashboard/chats/${orderId}`, { replace: true });
      }, 0);
    }
  };

  const handleTryAgain = () => {
    const data = rejectionData;
    setRejectionData(null);
    navigate('/checkout', { state: { reuploadOrder: data }, replace: true });
  };

  return (
    <AnimatePresence>
      {/* Verification Approved Modal */}
      {redirectData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-[24px] shadow-2xl p-8 max-w-md w-full text-center border border-[#E2E8F0]"
          >
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <HiCheckCircle className="w-10 h-10 text-green-500" />
            </div>

            <h2 className="text-2xl font-black text-[#0F172A] mb-2 tracking-tight">Payment Verified!</h2>
            <p className="text-[#64748B] text-[15px] mb-8 font-medium">
              Your payment has been successfully verified by our admins. You can now securely access the seller chat.
            </p>

            <div className="flex flex-col items-center gap-4">
              <Button onClick={handleImmediateRedirect} className="w-full flex justify-center items-center gap-2" size="lg">
                <HiChatAlt2 className="w-5 h-5" />
                Open Chat Now
              </Button>
              <div className="flex items-center justify-center gap-2 text-[#94A3B8] font-semibold text-sm">
                <span>Redirecting automatically in {countdown}</span>
                <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <HiArrowRight size={16} />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Verification Rejected Modal */}
      {rejectionData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-[24px] shadow-2xl p-8 max-w-md w-full text-center border border-[#E2E8F0]"
          >
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <HiXCircle className="w-10 h-10 text-red-500" />
            </div>

            <h2 className="text-2xl font-black text-[#0F172A] mb-2 tracking-tight">Payment Verification Rejected</h2>

            {rejectionData.productName && (
              <p className="text-[#5B4BFF] font-bold text-sm mb-4">{rejectionData.productName}</p>
            )}

            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-[16px] p-4 mb-6 text-left">
              <p className="text-xs font-bold text-[#991B1B] uppercase tracking-wider mb-1">Reason for Rejection:</p>
              <p className="text-sm font-medium text-[#7F1D1D] leading-relaxed">
                {rejectionData.rejectionReason || 'Payment screenshot could not be verified by the admin.'}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleTryAgain}
                className="w-full flex justify-center items-center gap-2 bg-[#EF4444] hover:bg-[#DC2626]"
                size="lg"
              >
                Try Again / Re-upload Screenshot
              </Button>
              <button
                onClick={() => setRejectionData(null)}
                className="text-xs font-bold text-[#64748B] hover:text-[#0F172A] py-2"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentApprovalHandler;
