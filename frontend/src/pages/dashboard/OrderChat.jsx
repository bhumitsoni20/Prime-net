import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import { useSocket } from '../../context/SocketContext';
import { apiGet, apiPost, apiPut } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  HiPaperAirplane, HiPaperClip, 
  HiChevronLeft, HiDotsVertical, HiCheckCircle, HiClock, 
  HiShieldCheck, HiOutlineDocumentDownload, HiOutlineExclamationCircle, HiExclamationCircle
} from 'react-icons/hi';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import ReviewModal from '../../components/ui/ReviewModal';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const OrderChat = ({ orderId: orderIdProp, onBack, onMessageSent }) => {
  const params = useParams();
  const navigate = useNavigate();
  const orderId = orderIdProp || params.id || params.orderId;
  const { user } = useAuthStore();
  const { socket, isConnected, getPresence, joinOrderRoom, leaveOrderRoom, markMessagesSeen } = useSocket();

  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credEmail, setCredEmail] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [credNotes, setCredNotes] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isSendingCreds, setIsSendingCreds] = useState(false);
  const [credSuccess, setCredSuccess] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const userScrolledUpRef = useRef(false);

  const isSeller = order?.seller?._id === user?._id;
  const otherUser = isSeller ? order?.user : order?.seller;
  const otherUserPresence = getPresence(otherUser?._id);

  // Auto-scroll handler
  const scrollToBottom = useCallback((force = false) => {
    if (force || !userScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    // If scrolled up more than 100px from bottom, consider user as reading history
    const isUp = scrollHeight - scrollTop - clientHeight > 100;
    userScrolledUpRef.current = isUp;
  };

  // Initial Fetch & Room Join
  useEffect(() => {
    fetchOrderAndMessages();
    joinOrderRoom(orderId);
    markMessagesSeen(orderId);

    return () => {
      leaveOrderRoom(orderId);
    };
  }, [orderId, joinOrderRoom, leaveOrderRoom, markMessagesSeen]);

  // Realtime Socket Event Listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      // Ensure message belongs to current chat
      const msgOrderId = typeof msg.orderId === 'object' ? msg.orderId?._id : msg.orderId;
      if (msgOrderId?.toString() !== orderId?.toString()) return;

      setMessages((prev) => {
        // Prevent duplicate messages
        const exists = prev.some((m) => m._id === msg._id || (m.tempId && m.tempId === msg.tempId));
        if (exists) {
          return prev.map((m) => (m._id === msg._id || (m.tempId && m.tempId === msg.tempId) ? msg : m));
        }
        return [...prev, msg];
      });

      // Mark seen if sent by other user
      const senderId = typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId;
      if (senderId !== user?._id) {
        markMessagesSeen(orderId);
      } else {
        scrollToBottom(true);
      }
    };

    const handleUserTyping = ({ orderId: typingOrderId, isTyping: typingStatus }) => {
      if (typingOrderId === orderId) setOtherUserTyping(typingStatus);
    };

    const handleMessagesSeen = ({ orderId: seenOrderId, userId }) => {
      if (seenOrderId === orderId && userId !== user?._id) {
        setMessages((prev) => prev.map((m) => (m.senderId?._id === user?._id ? { ...m, status: 'seen' } : m)));
      }
    };

    const handleOrderUpdated = (updatedOrder) => {
      const uId = updatedOrder.orderId || updatedOrder._id;
      if (uId === orderId?.toString()) {
        setOrder((prev) => ({
          ...prev,
          ...updatedOrder,
          product: prev?.product,
          seller: prev?.seller,
          user: prev?.user,
        }));
      }
    };

    const handleBundleProgressUpdated = ({ orderId: bOrderId, credentials, orderStatus }) => {
      if (bOrderId?.toString() === orderId?.toString()) {
        setOrder((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            orderStatus: orderStatus || prev.orderStatus,
            credentials: credentials || prev.credentials,
          };
        });
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('messages_seen', handleMessagesSeen);
    socket.on('order_updated', handleOrderUpdated);
    socket.on('bundle_progress_updated', handleBundleProgressUpdated);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('messages_seen', handleMessagesSeen);
      socket.off('order_updated', handleOrderUpdated);
      socket.off('bundle_progress_updated', handleBundleProgressUpdated);
    };
  }, [socket, orderId, user?._id, markMessagesSeen, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping, scrollToBottom]);

  const fetchOrderAndMessages = async () => {
    try {
      setIsLoading(true);
      const [orderRes, messagesRes] = await Promise.all([
        apiGet(`/orders/${orderId}`),
        apiGet(`/orders/${orderId}/chat`),
      ]);
      setOrder(orderRes.data);
      setMessages(messagesRes.data || []);
      apiPut(`/orders/${orderId}/seen`).catch(console.error);
    } catch (error) {
      toast.error('Failed to load chat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (socket && isConnected) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('typing', { orderId, isTyping: true });
      }
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit('typing', { orderId, isTyping: false });
      }, 1500);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage('');

    if (socket && isConnected) {
      setIsTyping(false);
      socket.emit('typing', { orderId, isTyping: false });
    }

    // Optimistic UI Message
    const tempId = 'temp_' + Date.now();
    const optimisticMessage = {
      _id: tempId,
      tempId,
      orderId,
      senderId: { _id: user._id, name: user.name, avatar: user.avatar },
      content,
      type: 'text',
      status: 'sending',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom(true);

    try {
      const res = await apiPost(`/orders/${orderId}/chat`, { content, type: 'text' });
      if (res.data) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data._id)) {
            return prev.filter((m) => m.tempId !== tempId);
          }
          return prev.map((m) =>
            m.tempId === tempId ? { ...res.data, status: res.data.status || 'sent' } : m
          );
        });
        if (onMessageSent) onMessageSent();
      }
    } catch (err) {
      toast.error('Failed to send message');
      setMessages((prev) => prev.filter((m) => m.tempId !== tempId));
    }
  };

  const deliverCredentials = async (e) => {
    e.preventDefault();
    if (isSendingCreds) return;
    try {
      setIsSendingCreds(true);
      if (order.bundle) {
        if (!selectedProductId) return toast.error('Select a product to deliver');
        await apiPut(`/bundle-orders/${orderId}/deliver/${selectedProductId}`, {
          email: credEmail,
          password: credPassword,
          notes: credNotes,
        });
      } else {
        await apiPut(`/orders/${orderId}/deliver`, {
          email: credEmail,
          password: credPassword,
          notes: credNotes,
        });
      }

      setCredSuccess(true);
      toast.success('Credentials delivered!');
      setShowCredentialsModal(false);
      setCredSuccess(false);
      setCredEmail('');
      setCredPassword('');
      setCredNotes('');
      setSelectedProductId('');
      fetchOrderAndMessages();
    } catch (err) {
      toast.error('Failed to deliver credentials');
    } finally {
      setIsSendingCreds(false);
    }
  };

  const handleCompleteOrder = async () => {
    try {
      await apiPut(`/orders/${orderId}/status`, { orderStatus: 'completed' });
      toast.success('Order completed successfully!');
      await fetchOrderAndMessages();

      if (order.product?._id || typeof order.product === 'string' || order.bundle) {
        setShowReviewModal(true);
      }
    } catch (err) {
      toast.error('Failed to complete order');
    }
  };

  const submitReview = async ({ rating, comment, productId, productRatings }) => {
    if (!rating) return toast.error('Please select a rating');

    try {
      let targetProductId = productId;
      let isBundle = false;
      let targetBundleId = null;

      if (!targetProductId) {
        if (order.bundle) {
          isBundle = true;
          targetBundleId = typeof order.bundle === 'object' ? order.bundle?._id : order.bundle;
        } else {
          targetProductId = typeof order.product === 'object' ? order.product?._id : order.product;
        }
      }

      if (!targetProductId && !isBundle) return toast.error('Product/Bundle no longer exists');

      await apiPost('/reviews', {
        productId: targetProductId,
        bundleId: targetBundleId,
        rating,
        comment,
        productRatings,
      });
      toast.success('Review submitted successfully!');
      setShowReviewModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };



  const handleDownloadInvoice = () => {
    const itemTitle = order?.bundle?.title || order?.product?.title || 'Digital Product';
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - StreamKart #${order._id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #0f172a; max-width: 750px; margin: 0 auto; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 26px; font-weight: 800; color: #5B4BFF; tracking: -0.02em; }
            .title { font-size: 14px; text-transform: uppercase; color: #64748b; font-weight: 700; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-box { background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .info-box h4 { margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; color: #64748b; }
            .info-box p { margin: 0; font-weight: 600; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; background: #f1f5f9; padding: 12px 16px; font-size: 12px; text-transform: uppercase; color: #475569; }
            td { padding: 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 600; }
            .total-row td { border-bottom: none; font-size: 18px; font-weight: 800; color: #5B4BFF; }
            .footer { text-align: center; margin-top: 40px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">
              <img src="${window.location.origin}/streamkart-logo-nav.png" alt="StreamKart" style="height: 150px; margin-top:10px; object-fit: contain;" />
            </div>
            <div>
              <div class="title">INVOICE</div>
              <div style="font-weight: 700;">#${order._id.toUpperCase()}</div>
            </div>
          </div>
          <div class="info-grid">
            <div class="info-box">
              <h4>Billed To</h4>
              <p>${user?.name || 'Customer'}</p>
              <p style="font-weight:400; color:#64748b; font-size:12px;">${user?.email || ''}</p>
            </div>
            <div class="info-box">
              <h4>Order Details</h4>
              <p>Date: ${dayjs(order.createdAt).format('MMM D, YYYY')}</p>
              <p>Payment: ${order.paymentMethod?.toUpperCase()}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Type</th>
                <th style="text-align:right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${itemTitle}</td>
                <td>${order.bundle ? 'Bundle Package' : 'Subscription Product'}</td>
                <td style="text-align:right;">₹${order.amount}</td>
              </tr>
              <tr class="total-row">
                <td colspan="2">Total Paid</td>
                <td style="text-align:right;">₹${order.amount}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            Thank you for purchasing via StreamKart! For support inquiries, visit streamkart.com
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(invoiceHtml);
      win.document.close();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F8FAFC]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] p-6 text-center">
        <p className="text-[#64748B] mb-4">Order not found</p>
        <Button onClick={onBack || (() => navigate('/dashboard/orders'))}>Back to Orders</Button>
      </div>
    );
  }

  // Compute Bundle Progress
  const isBundle = !!order.bundle;
  const bundleCredentials = Array.isArray(order.credentials) ? order.credentials : [];
  const totalBundleItems = bundleCredentials.length;
  const deliveredBundleItems = bundleCredentials.filter((c) => c.deliveryStatus === 'delivered').length;

  const renderSidebarContent = () => (
    <>
      <div className="mb-8">
        <h3 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] mb-4 pl-1">Conversation With</h3>
        <div className="flex items-center gap-4 p-4 rounded-[16px] bg-[#F8FAFC] border border-[#F1F5F9] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-[#5B4BFF]/10 to-[#7C3AED]/10 rounded-[14px] flex items-center justify-center text-[#5B4BFF] font-extrabold text-xl shadow-sm">
              {otherUser?.name?.[0] || 'U'}
            </div>
            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${otherUserPresence.status === 'online' ? 'bg-[#10B981]' : 'bg-[#CBD5E1]'}`} />
          </div>
          <div>
            <div className="font-bold text-[#0F172A] text-[15px]">{otherUser?.name || 'User'}</div>
            <div className="text-[12px] text-[#64748B] font-medium mt-0.5">{isSeller ? 'Buyer' : 'Seller'}</div>
          </div>
        </div>
      </div>

      {/* Bundle Progress Counter */}
      {order.bundle && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 pl-1">
            <h3 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">Bundle Progress</h3>
            <span className="text-[12px] font-extrabold text-[#5B4BFF] bg-[#EEF2FF] px-2.5 py-0.5 rounded-full">
              {deliveredBundleItems} / {totalBundleItems}
            </span>
          </div>
          <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden mb-4">
            <motion.div
              className="bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED] h-full"
              initial={{ width: 0 }}
              animate={{ width: `${totalBundleItems > 0 ? (deliveredBundleItems / totalBundleItems) * 100 : 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="space-y-2.5">
            {bundleCredentials.map((cred) => (
              <div key={cred.productId?._id || cred._id} className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white border border-[#F1F5F9] rounded-lg flex items-center justify-center shadow-sm text-[10px] font-bold text-[#5B4BFF]">
                    {cred.productId?.logo ? <img src={cred.productId.logo} className="w-5 h-5 object-contain" alt="" /> : (cred.productId?.title?.[0] || '?')}
                  </div>
                  <span className="font-semibold text-[#0F172A] text-[13px]">{cred.productId?.title || 'Product'}</span>
                </div>
                <div>
                  {cred.deliveryStatus === 'delivered' ? (
                    <HiCheckCircle className="w-5 h-5 text-[#10B981]" />
                  ) : (
                    <span className="w-5 h-5 rounded-full border-2 border-[#CBD5E1] block"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto space-y-3 pt-6 border-t border-[#F1F5F9]">
        {isSeller && order.orderStatus !== 'delivered' && order.orderStatus !== 'completed' && (
          <Button size="lg" className="w-full shadow-[0_4px_14px_rgba(91,75,255,0.3)] bg-[#5B4BFF] hover:bg-[#4F3FE8]" onClick={() => { setShowMobileSidebar(false); setShowCredentialsModal(true); }}>
            <HiShieldCheck className="w-[20px] h-[20px] mr-2" /> Secure Deliver Credentials
          </Button>
        )}
        {!isSeller && order.orderStatus === 'delivered' && (
          <Button size="lg" onClick={() => { setShowMobileSidebar(false); handleCompleteOrder(); }} className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white shadow-[0_4px_14px_rgba(22,163,74,0.3)] border-none">
            Confirm & Complete
          </Button>
        )}
        {!isSeller && order.orderStatus === 'completed' && !order.isReviewed && (
          <Button size="lg" onClick={() => { setShowMobileSidebar(false); setShowReviewModal(true); }} className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white shadow-[0_4px_14px_rgba(245,158,11,0.3)] border-none">
            ★ Rate & Review Experience
          </Button>
        )}

        <Button variant="secondary" size="lg" onClick={handleDownloadInvoice} className="w-full flex items-center justify-center gap-2 border border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]">
          <HiOutlineDocumentDownload className="w-5 h-5 text-[#5B4BFF]" /> Download Invoice
        </Button>

        <Button variant="secondary" size="lg" onClick={() => { setShowMobileSidebar(false); navigate('/contact'); }} className="w-full flex items-center justify-center gap-2 border border-[#FEE2E2] text-[#EF4444] hover:bg-[#FEF2F2]">
          <HiOutlineExclamationCircle className="w-5 h-5 text-[#EF4444]" /> Report Issue
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden font-sans h-full">
      {/* Top Navbar */}
      <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] flex items-center justify-between px-3 sm:px-6 z-10 shrink-0 shadow-sm gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button onClick={onBack || (() => window.history.back())} className="p-1.5 sm:p-2 hover:bg-[#F1F5F9] rounded-full transition-colors md:hidden shrink-0">
            <HiChevronLeft className="w-[22px] h-[22px] text-[#64748B]" />
          </button>
          {!onBack && (
            <Link to="/dashboard/orders" className="p-2 hover:bg-[#F1F5F9] rounded-full transition-colors hidden md:block shrink-0">
              <HiChevronLeft className="w-[22px] h-[22px] text-[#64748B]" />
            </Link>
          )}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-center overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] shrink-0">
              {(order.bundle?.thumbnail || order.product?.logo) ? (
                <img src={order.bundle?.thumbnail || order.product?.logo} className="w-full h-full object-contain p-1.5" alt="Logo" />
              ) : (
                <span className="font-extrabold text-[#5B4BFF]">{(order.bundle?.title?.[0] || order.product?.title?.[0]) || '?'}</span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-[#0F172A] leading-tight truncate text-[15px] sm:text-[17px]">
                {order.bundle?.title || order.product?.title || 'Order Chat'}
              </h1>
              <div className="flex items-center gap-2 text-[11px] sm:text-[12px] text-[#94A3B8] font-semibold tracking-wide truncate">
                <span>ORDER #{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                {otherUserPresence.status === 'online' && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                      <span className="text-[#10B981] font-bold">Online</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-4 shrink-0">
          <div className={`px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] shadow-sm ${
            order.orderStatus === 'delivered' ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]' : 
            order.orderStatus === 'completed' ? 'bg-[#EEF2FF] text-[#5B4BFF] border border-[#C7D2FE]' :
            'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
          }`}>
            {order.orderStatus}
          </div>
          <button onClick={() => setShowMobileSidebar(!showMobileSidebar)} className="p-1 sm:p-2 hover:bg-[#F1F5F9] rounded-full xl:hidden transition-colors shrink-0">
            <HiDotsVertical className="w-5 h-5 text-[#64748B]"/>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Order & Bundle Context (Desktop xl+) */}
        <aside className="w-80 bg-white border-r border-[#E2E8F0] flex-shrink-0 hidden xl:flex flex-col p-6 overflow-y-auto z-10 shadow-sm">
          {renderSidebarContent()}
        </aside>

        {/* Slide-over Drawer (< xl) */}
        <AnimatePresence>
          {showMobileSidebar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex justify-end xl:hidden"
              onClick={() => setShowMobileSidebar(false)}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                className="w-80 max-w-[85vw] bg-white h-full p-6 overflow-y-auto flex flex-col shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {renderSidebarContent()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center - Chat Area */}
        <main className="flex-1 flex flex-col relative bg-[#F8FAFC]">
          <div 
            ref={chatContainerRef} 
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative z-10 custom-scrollbar"
          >
            {messages.map((msg) => {
              const msgSenderId = typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId;
              const isMine = msgSenderId === user?._id;

              if (msg.type === 'system') {
                return (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg._id || msg.tempId} className="flex justify-center my-6">
                    <div className="bg-[#E2E8F0]/80 backdrop-blur-md text-[#475569] text-[11px] py-1.5 px-5 rounded-full font-bold tracking-wide shadow-sm border border-[#CBD5E1]/50">
                      {msg.content}
                    </div>
                  </motion.div>
                );
              }

              if (msg.type === 'credentials' || msg.type === 'bundle_credentials') {
                const credData = msg.type === 'bundle_credentials'
                  ? (msg.metadata?.email ? msg.metadata : order.credentials?.find((c) => c.productId?._id === msg.metadata?.productId || c.productId === msg.metadata?.productId))
                  : order.credentials;

                return (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={msg._id || msg.tempId} className={`flex ${isMine ? 'justify-end' : 'justify-start'} max-w-full`}>
                    <div className="w-full max-w-[280px] sm:max-w-sm bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-[24px] p-4 sm:p-6 text-white shadow-[0_12px_30px_rgba(0,0,0,0.15)] border border-[#334155]">
                      <div className="flex items-center gap-3 sm:gap-4 mb-4 border-b border-[#334155] pb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-[#22C55E]/10 rounded-[14px] border border-[#22C55E]/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
                          <HiShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#4ADE80]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-[15px] sm:text-[17px] mb-0.5 tracking-tight truncate">Secure Delivery</h4>
                          <p className="text-[11px] sm:text-[12px] text-[#94A3B8] font-medium leading-tight truncate">
                            Credentials delivered {credData?.productId?.title ? `for ${credData.productId.title}` : ''}
                          </p>
                        </div>
                      </div>

                      {!isMine && credData && (
                        <div className="space-y-3 bg-black/40 p-4 rounded-[16px] font-mono text-[12px] sm:text-[13px] border border-[#334155]/50 shadow-inner break-all">
                          <div>
                            <span className="text-[#64748B] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] block mb-1">Email / Username</span>
                            <span className="text-white select-all font-bold">{credData.email}</span>
                          </div>
                          <div>
                            <span className="text-[#64748B] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] block mb-1">Password</span>
                            <span className="text-white select-all font-bold">{credData.password}</span>
                          </div>
                          {credData.notes && (
                            <div>
                              <span className="text-[#64748B] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] block mb-1">Notes</span>
                              <span className="text-white whitespace-pre-wrap">{credData.notes}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {isMine && (
                        <div className="text-center text-[13px] text-[#94A3B8] italic mt-3 bg-[#0F172A] py-3 rounded-[12px] border border-[#1E293B]">
                          You have sent the credentials securely.
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg._id || msg.tempId} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[78%] ${isMine ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                    <div className="w-9 h-9 rounded-full bg-white border border-[#E2E8F0] shadow-sm flex-shrink-0 flex items-center justify-center text-[13px] font-extrabold text-[#64748B]">
                      {typeof msg.senderId === 'object' ? msg.senderId?.name?.[0] || 'U' : 'U'}
                    </div>
                    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div className={`px-5 py-3.5 rounded-[20px] ${isMine ? 'bg-[#5B4BFF] text-white rounded-tr-[4px] shadow-[0_4px_14px_rgba(91,75,255,0.25)]' : 'bg-white text-[#0F172A] rounded-tl-[4px] border border-[#E2E8F0] shadow-sm'}`}>
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#94A3B8] font-bold tracking-wide">
                        {dayjs(msg.createdAt).format('h:mm A')}
                        {isMine && (
                          <span className="ml-0.5">
                            {msg.status === 'sending' ? (
                              <HiClock className="w-[14px] h-[14px] text-[#94A3B8] animate-spin" />
                            ) : msg.status === 'seen' ? (
                              <HiCheckCircle className="w-[14px] h-[14px] text-[#5B4BFF]" />
                            ) : (
                              <HiCheckCircle className="w-[14px] h-[14px] text-[#CBD5E1]" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {otherUserTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-center text-[#94A3B8] text-sm font-medium">
                <div className="w-9 h-9 rounded-full bg-white border border-[#E2E8F0] shadow-sm flex-shrink-0 flex items-center justify-center text-[13px] font-extrabold text-[#64748B]">
                  {otherUser?.name?.[0] || 'U'}
                </div>
                <div className="bg-white px-5 py-3.5 rounded-[20px] rounded-tl-[4px] border border-[#E2E8F0] shadow-sm flex gap-1.5 items-center h-[46px]">
                  <span className="w-2 h-2 bg-[#94A3B8] rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-[#94A3B8] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-5 bg-white border-t border-[#E2E8F0] z-10 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
            <form onSubmit={sendMessage} className="flex items-center gap-2 sm:gap-3">
              <button type="button" className="p-2 sm:p-3 text-[#94A3B8] hover:text-[#5B4BFF] hover:bg-[#EEF2FF] rounded-full transition-colors hidden sm:block shrink-0">
                <HiPaperClip className="w-[22px] h-[22px]" />
              </button>
              <div className="flex-1 relative min-w-0">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:bg-white focus:border-[#5B4BFF] focus:ring-[3px] focus:ring-[#5B4BFF]/10 rounded-full pl-4 sm:pl-6 pr-10 sm:pr-12 py-3 sm:py-3.5 text-[14px] sm:text-[15px] text-[#0F172A] placeholder-[#94A3B8] transition-all shadow-sm outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="w-11 h-11 sm:w-12 sm:h-12 bg-[#5B4BFF] hover:bg-[#4F3FE8] disabled:opacity-50 disabled:hover:bg-[#5B4BFF] text-white rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(91,75,255,0.3)] transition-all shrink-0 hover:scale-105 active:scale-95"
              >
                <HiPaperAirplane className="w-5 h-5 rotate-90" />
              </button>
            </form>
          </div>
        </main>
      </div>

      {/* Credentials Modal */}
      <AnimatePresence>
        {showCredentialsModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-md flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget && !isSendingCreds) setShowCredentialsModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[20px] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] p-6 w-full max-w-sm border border-[#E2E8F0] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED]" />
              
              <button
                type="button"
                onClick={() => !isSendingCreds && setShowCredentialsModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] flex items-center justify-center transition-colors z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              {credSuccess ? (
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-10">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="w-20 h-20 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center mb-5 shadow-lg shadow-[#10B981]/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <motion.path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.2 }} />
                    </svg>
                  </motion.div>
                  <h3 className="text-[20px] font-bold text-[#0F172A] mb-1">Sent Successfully!</h3>
                  <p className="text-[#64748B] text-[13px]">Credentials delivered securely.</p>
                </motion.div>
              ) : (
                <>
                  <div className="w-14 h-14 bg-gradient-to-br from-[#5B4BFF]/10 to-[#7C3AED]/10 text-[#5B4BFF] rounded-[14px] flex items-center justify-center mb-4 mx-auto">
                    <HiShieldCheck className="w-7 h-7" />
                  </div>
                  <h2 className="text-[20px] font-extrabold text-center text-[#0F172A] mb-1 tracking-tight">Deliver Credentials</h2>
                  <p className="text-center text-[#64748B] text-[13px] mb-6 leading-relaxed">Enter the secure delivery details below.</p>

                  <form onSubmit={deliverCredentials} className="space-y-4">
                    {order.bundle && (
                      <div>
                        <label className="block text-[11px] font-bold text-[#64748B] mb-1.5 uppercase tracking-[0.08em]">Select Product</label>
                        <select required value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] focus:bg-white focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] outline-none transition-all text-[#0F172A] text-[14px] appearance-none">
                          <option value="">-- Choose product --</option>
                          {order.credentials?.map((cred) => (
                            <option key={cred.productId?._id || cred._id} value={cred.productId?._id || cred._id} disabled={cred.deliveryStatus === 'delivered'}>
                              {cred.productId?.title || 'Product'} {cred.deliveryStatus === 'delivered' ? '(Delivered ✓)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-[11px] font-bold text-[#64748B] mb-1.5 uppercase tracking-[0.08em]">Email / Username</label>
                      <input type="text" required value={credEmail} onChange={(e) => setCredEmail(e.target.value)} className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] focus:bg-white focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] outline-none transition-all text-[#0F172A] font-mono text-[14px]" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#64748B] mb-1.5 uppercase tracking-[0.08em]">Password</label>
                      <input type="text" required value={credPassword} onChange={(e) => setCredPassword(e.target.value)} className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] focus:bg-white focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] outline-none transition-all text-[#0F172A] font-mono text-[14px]" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#64748B] mb-1.5 uppercase tracking-[0.08em]">Additional Notes (Optional)</label>
                      <textarea rows="2" value={credNotes} onChange={(e) => setCredNotes(e.target.value)} className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] focus:bg-white focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] outline-none transition-all resize-none text-[#0F172A] text-[14px]"></textarea>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowCredentialsModal(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSendingCreds} className="flex-1 shadow-[0_4px_14px_rgba(91,75,255,0.3)]">
                        {isSendingCreds ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                            Sending...
                          </span>
                        ) : (
                          'Send Securely'
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={submitReview}
        otherUserName={otherUser?.name}
        bundleProducts={order?.bundle?.products || []}
      />


    </div>
  );
};

export default OrderChat;
