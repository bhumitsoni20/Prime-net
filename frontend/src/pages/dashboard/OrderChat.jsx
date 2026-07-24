import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import useAuthStore from '../../store/authStore';
import { apiGet, apiPost, apiPut } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  HiPaperAirplane, HiPhotograph, HiPaperClip, HiEmojiHappy, 
  HiChevronLeft, HiDotsVertical, HiCheckCircle, HiClock, 
  HiShieldCheck, HiOutlineDocumentDownload, HiOutlineExclamationCircle, HiStar, HiOutlineStar 
} from 'react-icons/hi';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

const OrderChat = ({ orderId: orderIdProp, onBack }) => {
  const params = useParams();
  const navigate = useNavigate();
  const orderId = orderIdProp || params.id || params.orderId;
  const { user, token } = useAuthStore();
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

  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const isSeller = order?.seller?._id === user?._id;
  const otherUser = isSeller ? order?.user : order?.seller;

  useEffect(() => {
    fetchOrderAndMessages();
    initSocket();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchOrderAndMessages = async () => {
    try {
      setIsLoading(true);
      const [orderRes, messagesRes] = await Promise.all([
        apiGet(`/orders/${orderId}`),
        apiGet(`/orders/${orderId}/chat`)
      ]);
      setOrder(orderRes.data);
      setMessages(messagesRes.data);
      apiPut(`/orders/${orderId}/seen`).catch(console.error); // mark seen silently
    } catch (error) {
      toast.error('Failed to load chat');
    } finally {
      setIsLoading(false);
    }
  };

  const initSocket = () => {
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_order', orderId);
    });

    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
      if (msg.senderId._id !== user._id) {
        apiPut(`/orders/${orderId}/seen`).catch(console.error);
      }
    });

    socket.on('user_typing', ({ userId, isTyping }) => {
      if (userId !== user._id) setOtherUserTyping(isTyping);
    });

    socket.on('messages_seen', ({ userId }) => {
      if (userId !== user._id) {
        setMessages(prev => prev.map(m => m.status !== 'seen' && m.senderId._id === user._id ? { ...m, status: 'seen' } : m));
      }
    });

    socket.on('order_updated', (updatedOrder) => {
      setOrder(prev => ({ 
        ...prev, 
        ...updatedOrder,
        product: prev?.product,
        seller: prev?.seller,
        user: prev?.user
      }));
    });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socketRef.current) {
      if (!isTyping) {
        setIsTyping(true);
        socketRef.current.emit('typing', { orderId, isTyping: true });
      }
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socketRef.current.emit('typing', { orderId, isTyping: false });
      }, 1500);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage;
    setNewMessage('');
    if (socketRef.current) {
      setIsTyping(false);
      socketRef.current.emit('typing', { orderId, isTyping: false });
    }

    try {
      await apiPost(`/orders/${orderId}/chat`, { content, type: 'text' });
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const deliverCredentials = async (e) => {
    e.preventDefault();
    try {
      await apiPut(`/orders/${orderId}/deliver`, {
        email: credEmail,
        password: credPassword,
        notes: credNotes
      });
      toast.success('Credentials delivered!');
      setCredNotes('');
      setShowCredentialsModal(false);
    } catch (err) {
      toast.error('Failed to deliver credentials');
    }
  };

  const handleCompleteOrder = async () => {
    try {
      const res = await apiPut(`/orders/${orderId}/status`, { orderStatus: 'completed' });
      setOrder(prev => ({ 
        ...prev, 
        ...res.data,
        product: prev?.product,
        seller: prev?.seller,
        user: prev?.user
      }));
      toast.success('Order completed successfully!');
      
      // Only show review modal if product still exists
      if (order.product?._id || typeof order.product === 'string') {
        setShowReviewModal(true);
      }
    } catch (err) {
      toast.error('Failed to complete order');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error('Please select a rating');

    try {
      const productId = typeof order.product === 'object' ? order.product?._id : order.product;
      await apiPost('/reviews', {
        productId,
        rating,
        comment: reviewComment,
      });
      toast.success('Review submitted successfully!');
      setShowReviewModal(false);
    } catch (err) {
      toast.error('Failed to submit review');
    }
  };

  const handleDownloadInvoice = () => {
    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - ${order._id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .brand { font-size: 28px; font-weight: 800; color: #5B4BFF; }
            .invoice-details { text-align: right; font-size: 14px; color: #64748b; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
            .flex-row { display: flex; justify-content: space-between; font-size: 15px; }
            .item-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .item-table th, .item-table td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: left; font-size: 15px; }
            .item-table th { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
            .item-table td.amount { text-align: right; font-weight: 600; }
            .item-table th.amount { text-align: right; }
            .total-row { display: flex; justify-content: space-between; font-size: 20px; font-weight: 800; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e2e8f0; }
            .footer { margin-top: 60px; font-size: 13px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
             <div class="brand">StreamKart</div>
             <div class="invoice-details">
               <div><strong style="color:#0f172a; font-size:16px;">INVOICE</strong></div>
               <div>Date: ${new Date(order.createdAt).toLocaleDateString()}</div>
               <div>Order ID: ${order._id.substring(order._id.length - 8).toUpperCase()}</div>
             </div>
          </div>
          
          <div class="flex-row section">
            <div>
              <div class="section-title">Billed To</div>
              <strong>${order.user?.name || 'Customer'}</strong><br/>
              ${order.user?.email || 'N/A'}
            </div>
            <div style="text-align: right;">
              <div class="section-title">Seller</div>
              <strong>${order.seller?.name || 'Seller'}</strong><br/>
              ${order.seller?.email || 'N/A'}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Payment Details</div>
            <div>Transaction ID: <strong>${order.paymentId || 'N/A'}</strong></div>
            <div>Method: <strong style="text-transform: capitalize;">${order.paymentMethod}</strong></div>
            <div>Status: <strong style="color: #10b981; text-transform: uppercase;">${order.paymentStatus}</strong></div>
          </div>

          <div class="section">
            <table class="item-table">
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th class="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${order.product?.title || 'Digital Subscription'}</strong><br/>
                    <span style="font-size: 13px; color: #64748b;">Digital access delivery</span>
                  </td>
                  <td class="amount">₹${order.amount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="total-row">
              <div>Total Paid</div>
              <div style="color: #5B4BFF;">₹${order.amount.toLocaleString()}</div>
            </div>
          </div>

          <div class="footer">
            Thank you for your purchase. If you have any questions, please contact support@streamkart.com.
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    } else {
      toast.error('Popup blocked! Please allow popups to view the invoice.');
    }
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!order) return <div className="p-8 text-center flex-1 flex items-center justify-center text-[#94A3B8] font-medium">Order not found</div>;

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden font-sans h-full">
      {/* Top Navbar */}
      <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] flex items-center justify-between px-6 z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack || (() => window.history.back())} className="p-2 hover:bg-[#F1F5F9] rounded-full transition-colors md:hidden">
            <HiChevronLeft className="w-[22px] h-[22px] text-[#64748B]" />
          </button>
          {!onBack && (
            <Link to="/dashboard/orders" className="p-2 hover:bg-[#F1F5F9] rounded-full transition-colors hidden md:block">
              <HiChevronLeft className="w-[22px] h-[22px] text-[#64748B]" />
            </Link>
          )}
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-[12px] bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-center overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
              {order.product?.logo ? <img src={order.product.logo} className="w-full h-full object-contain p-1.5"/> : <span className="font-extrabold text-[#5B4BFF]">{order.product?.title?.[0] || '?'}</span>}
            </div>
            <div>
              <h1 className="font-bold text-[#0F172A] leading-tight truncate max-w-xs text-[17px]">{order.product?.title || 'Unknown Product'}</h1>
              <div className="text-[12px] text-[#94A3B8] font-semibold tracking-wide mt-0.5">ORDER #{order._id.substring(order._id.length - 8).toUpperCase()}</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] shadow-sm ${
            order.orderStatus === 'delivered' ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]' : 
            order.orderStatus === 'completed' ? 'bg-[#EEF2FF] text-[#5B4BFF] border border-[#C7D2FE]' :
            'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
          }`}>
            {order.orderStatus}
          </div>
          <button onClick={() => setShowMobileSidebar(!showMobileSidebar)} className="p-2 hover:bg-[#F1F5F9] rounded-full lg:hidden transition-colors">
            <HiDotsVertical className="w-5 h-5 text-[#64748B]"/>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Context (Hidden on small screens) */}
        <aside className="w-80 bg-white border-r border-[#E2E8F0] flex-shrink-0 hidden lg:flex flex-col p-6 overflow-y-auto z-10 shadow-sm">
          <div className="mb-8">
            <h3 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] mb-4 pl-1">Conversation With</h3>
            <div className="flex items-center gap-4 p-4 rounded-[16px] bg-[#F8FAFC] border border-[#F1F5F9] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
              <div className="w-12 h-12 bg-gradient-to-br from-[#5B4BFF]/10 to-[#7C3AED]/10 rounded-[14px] flex items-center justify-center text-[#5B4BFF] font-extrabold text-xl shadow-sm">
                {otherUser?.name?.[0] || 'U'}
              </div>
              <div>
                <div className="font-bold text-[#0F172A] text-[15px]">{otherUser?.name}</div>
                <div className="text-[12px] text-[#64748B] font-medium mt-0.5">{isSeller ? 'Buyer' : 'Seller'}</div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] mb-4 pl-1">Delivery Timer</h3>
            <div className="p-6 rounded-[20px] bg-gradient-to-br from-[#5B4BFF] to-[#7C3AED] text-white shadow-[0_8px_24px_rgba(91,75,255,0.35)] relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/20 rounded-full blur-[24px]"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-3 text-white/90 text-[13px] font-medium tracking-wide">
                  <HiClock className="w-5 h-5 opacity-90" /> Estimated Delivery
                </div>
                <div className="text-[26px] font-extrabold tracking-[-0.02em] leading-none">
                  {order.orderStatus === 'delivered' || order.orderStatus === 'completed' ? 'Delivered' : 'In Progress'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] mb-4 pl-1">Order Details</h3>
            <div className="space-y-4 text-[14px]">
              <div className="flex justify-between border-b border-[#F1F5F9] pb-3"><span className="text-[#64748B]">Amount</span><span className="font-bold text-[#0F172A]">₹{order.amount.toLocaleString()}</span></div>
              <div className="flex justify-between border-b border-[#F1F5F9] pb-3"><span className="text-[#64748B]">Date</span><span className="font-semibold text-[#0F172A]">{dayjs(order.createdAt).format('MMM D, YYYY')}</span></div>
              <div className="flex justify-between"><span className="text-[#64748B]">Payment</span><span className="font-semibold text-[#0F172A] capitalize">{order.paymentMethod}</span></div>
            </div>
          </div>
        </aside>

        {/* Center - Chat Area */}
        <main className="flex-1 flex flex-col relative bg-[#F8FAFC]">
          <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center] [mask-image:linear-gradient(to_bottom,transparent,black)] pointer-events-none" />
          <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 custom-scrollbar">
            {messages.map((msg, idx) => {
              const isMine = msg.senderId._id === user._id;
              
              if (msg.type === 'system') {
                return (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} key={msg._id} className="flex justify-center my-8">
                    <div className="bg-[#E2E8F0]/60 backdrop-blur-md text-[#475569] text-[11px] py-2 px-5 rounded-full font-bold tracking-wide shadow-sm border border-[#CBD5E1]/50">
                      {msg.content}
                    </div>
                  </motion.div>
                )
              }

              if (msg.type === 'credentials') {
                return (
                  <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className="w-full max-w-sm bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-[24px] p-7 text-white shadow-[0_12px_30px_rgba(0,0,0,0.15)] border border-[#334155]">
                      <div className="flex items-center gap-4 mb-5 border-b border-[#334155] pb-5">
                        <div className="w-12 h-12 bg-[#22C55E]/10 rounded-[14px] border border-[#22C55E]/20 flex items-center justify-center backdrop-blur-sm shadow-inner"><HiShieldCheck className="w-7 h-7 text-[#4ADE80]"/></div>
                        <div>
                          <h4 className="font-bold text-[17px] mb-0.5 tracking-tight">Secure Delivery</h4>
                          <p className="text-[12px] text-[#94A3B8] font-medium">Credentials have been delivered</p>
                        </div>
                      </div>
                      
                      {!isMine && order.credentials && (
                        <div className="space-y-4 bg-black/40 p-5 rounded-[16px] font-mono text-[13px] border border-[#334155]/50 shadow-inner">
                          <div><span className="text-[#64748B] text-[11px] font-bold uppercase tracking-[0.08em] block mb-1">Email / Username</span><span className="text-white select-all">{order.credentials.email}</span></div>
                          <div><span className="text-[#64748B] text-[11px] font-bold uppercase tracking-[0.08em] block mb-1">Password</span><span className="text-white select-all">{order.credentials.password}</span></div>
                          {order.credentials.notes && <div><span className="text-[#64748B] text-[11px] font-bold uppercase tracking-[0.08em] block mb-1">Notes</span><span className="text-white whitespace-pre-wrap">{order.credentials.notes}</span></div>}
                        </div>
                      )}
                      {isMine && (
                        <div className="text-center text-[13px] text-[#94A3B8] italic mt-3 bg-[#0F172A] py-3 rounded-[12px] border border-[#1E293B]">You have sent the credentials securely.</div>
                      )}
                    </div>
                  </motion.div>
                )
              }

              return (
                <motion.div 
                  initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} 
                  key={msg._id} 
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[75%] ${isMine ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                    <div className="w-9 h-9 rounded-full bg-white border border-[#E2E8F0] shadow-sm flex-shrink-0 flex items-center justify-center text-[13px] font-extrabold text-[#64748B]">
                      {msg.senderId.name[0]}
                    </div>
                    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div className={`px-5 py-3.5 rounded-[20px] ${isMine ? 'bg-[#5B4BFF] text-white rounded-tr-[4px] shadow-[0_4px_14px_rgba(91,75,255,0.25)]' : 'bg-white text-[#0F172A] rounded-tl-[4px] border border-[#E2E8F0] shadow-sm'}`}>
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#94A3B8] font-bold tracking-wide">
                        {dayjs(msg.createdAt).format('h:mm A')}
                        {isMine && (
                          <span className="ml-0.5">
                            {msg.status === 'seen' ? <HiCheckCircle className="w-[14px] h-[14px] text-[#5B4BFF]"/> : <HiCheckCircle className="w-[14px] h-[14px] text-[#CBD5E1]"/>}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {otherUserTyping && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex gap-3 items-center text-[#94A3B8] text-sm font-medium">
                <div className="w-9 h-9 rounded-full bg-white border border-[#E2E8F0] shadow-sm flex-shrink-0 flex items-center justify-center text-[13px] font-extrabold text-[#64748B]">{otherUser?.name?.[0]}</div>
                <div className="bg-white px-5 py-3.5 rounded-[20px] rounded-tl-[4px] border border-[#E2E8F0] shadow-sm flex gap-1.5 items-center h-[46px]">
                  <span className="w-2 h-2 bg-[#94A3B8] rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-[#94A3B8] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                  <span className="w-2 h-2 bg-[#94A3B8] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Chat Input */}
          <div className="p-5 bg-white border-t border-[#E2E8F0] z-10 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
            <form onSubmit={sendMessage} className="flex items-center gap-3">
              <button type="button" className="p-3 text-[#94A3B8] hover:text-[#5B4BFF] hover:bg-[#EEF2FF] rounded-full transition-colors hidden sm:block">
                <HiPaperClip className="w-[22px] h-[22px]" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:bg-white focus:border-[#5B4BFF] focus:ring-[3px] focus:ring-[#5B4BFF]/10 rounded-full pl-6 pr-12 py-3.5 text-[15px] text-[#0F172A] placeholder-[#94A3B8] transition-all shadow-sm outline-none"
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-[#94A3B8] hover:text-[#5B4BFF] transition-colors">
                  <HiEmojiHappy className="w-[22px] h-[22px]" />
                </button>
              </div>
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="w-[52px] h-[52px] bg-[#5B4BFF] hover:bg-[#4F3FE8] disabled:bg-[#E2E8F0] disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(91,75,255,0.4)] transition-all active:scale-95 disabled:shadow-none disabled:text-[#94A3B8]"
              >
                <HiPaperAirplane className="w-6 h-6 transform rotate-90 ml-1" />
              </button>
            </form>
          </div>
        </main>

        {/* Right Sidebar - Actions */}
        <div className={`fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-20 transition-opacity lg:hidden ${showMobileSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowMobileSidebar(false)}></div>
        <aside className={`absolute right-0 top-0 bottom-0 z-30 w-80 bg-white border-l border-[#E2E8F0] flex-shrink-0 flex flex-col p-6 overflow-y-auto transform transition-transform duration-300 lg:relative ${showMobileSidebar ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'}`}>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">Order Timeline</h3>
              <button onClick={() => setShowMobileSidebar(false)} className="lg:hidden p-2 bg-[#F1F5F9] rounded-full text-[#64748B] hover:text-[#0F172A] transition-colors">✕</button>
            </div>
            <div className="space-y-6">
              {['placed', 'preparing', 'delivered', 'completed'].map((step, idx) => {
                const stepIndex = ['placed', 'preparing', 'delivered', 'completed'].indexOf(order.orderStatus);
                const isPassed = idx <= stepIndex;
                const isCurrent = idx === stepIndex;
                return (
                  <div key={step} className="flex gap-4 relative">
                    {idx < 3 && <div className={`absolute left-3.5 top-8 bottom-[-24px] w-0.5 ${isPassed && !isCurrent ? 'bg-[#5B4BFF]' : 'bg-[#E2E8F0]'}`}></div>}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${isPassed ? 'bg-[#5B4BFF] text-white shadow-[0_2px_8px_rgba(91,75,255,0.4)]' : 'bg-white text-[#94A3B8] border-2 border-[#E2E8F0]'}`}>
                      {isPassed ? <HiCheckCircle className="w-[18px] h-[18px]"/> : <div className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1]"></div>}
                    </div>
                    <div className={`flex-1 ${isPassed ? 'opacity-100' : 'opacity-50'}`}>
                      <p className={`text-[14px] font-bold capitalize ${isPassed ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>{step}</p>
                      {isCurrent && <p className="text-[12px] text-[#5B4BFF] font-bold tracking-wide mt-0.5">CURRENT PHASE</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-auto space-y-3 pt-6 border-t border-[#F1F5F9]">
            {isSeller && order.orderStatus !== 'delivered' && order.orderStatus !== 'completed' && (
              <Button size="lg" className="w-full shadow-[0_4px_14px_rgba(91,75,255,0.3)] bg-[#5B4BFF] hover:bg-[#4F3FE8] mb-4" onClick={() => setShowCredentialsModal(true)}>
                <HiShieldCheck className="w-[20px] h-[20px] mr-2" /> Secure Deliver Order
              </Button>
            )}
            {!isSeller && order.orderStatus === 'delivered' && (
              <Button size="lg" onClick={handleCompleteOrder} className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white shadow-[0_4px_14px_rgba(22,163,74,0.3)] mb-4 border-none">
                Confirm & Complete
              </Button>
            )}
            <Button variant="secondary" onClick={handleDownloadInvoice} className="w-full bg-white hover:bg-[#F8FAFC] border-[#E2E8F0] shadow-sm">
              <HiOutlineDocumentDownload className="w-[18px] h-[18px] mr-2 text-[#64748B]" /> <span className="text-[#334155]">Download Invoice</span>
            </Button>
            <Button variant="outline" onClick={() => navigate('/contact')} className="w-full text-[#EF4444] border-[#EF4444]/20 hover:bg-[#FEF2F2] hover:border-[#EF4444]/40">
              <HiOutlineExclamationCircle className="w-[18px] h-[18px] mr-2" /> Report Issue
            </Button>
          </div>
        </aside>
      </div>

      {/* Credentials Modal */}
      <AnimatePresence>
        {showCredentialsModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[24px] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] p-8 w-full max-w-md border border-[#E2E8F0] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED]" />
              <div className="w-20 h-20 bg-gradient-to-br from-[#5B4BFF]/10 to-[#7C3AED]/10 text-[#5B4BFF] rounded-[20px] flex items-center justify-center mb-6 mx-auto shadow-sm">
                <HiShieldCheck className="w-10 h-10" />
              </div>
              <h2 className="text-[24px] font-extrabold text-center text-[#0F172A] mb-2 tracking-tight">Deliver Credentials</h2>
              <p className="text-center text-[#64748B] text-[14px] mb-8 leading-relaxed px-4">Enter the secure delivery details below. These will be encrypted and sent to the buyer.</p>
              
              <form onSubmit={deliverCredentials} className="space-y-5">
                <div>
                  <label className="block text-[12px] font-bold text-[#64748B] mb-2 uppercase tracking-[0.08em]">Email / Username</label>
                  <input type="text" required value={credEmail} onChange={e=>setCredEmail(e.target.value)} className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] focus:bg-white focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] outline-none transition-all text-[#0F172A] font-mono"/>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#64748B] mb-2 uppercase tracking-[0.08em]">Password</label>
                  <input type="text" required value={credPassword} onChange={e=>setCredPassword(e.target.value)} className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] focus:bg-white focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] outline-none transition-all text-[#0F172A] font-mono"/>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#64748B] mb-2 uppercase tracking-[0.08em]">Additional Notes (Optional)</label>
                  <textarea rows="3" value={credNotes} onChange={e=>setCredNotes(e.target.value)} className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] focus:bg-white focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] outline-none transition-all resize-none text-[#0F172A]"></textarea>
                </div>
                <div className="flex gap-4 pt-6">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowCredentialsModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 shadow-[0_4px_14px_rgba(91,75,255,0.3)]">Send Securely</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[24px] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] p-8 w-full max-w-md border border-[#E2E8F0] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />
              <div className="w-20 h-20 bg-amber-50 rounded-[20px] flex items-center justify-center mb-6 mx-auto">
                <span className="text-4xl">🌟</span>
              </div>
              <h2 className="text-[24px] font-extrabold text-center text-[#0F172A] mb-2 tracking-tight">Rate Your Experience</h2>
              <p className="text-center text-[#64748B] text-[15px] mb-8">How was your experience with {otherUser?.name || 'this seller'}?</p>
              
              <form onSubmit={submitReview} className="space-y-8">
                <div className="flex justify-center gap-3 bg-[#F8FAFC] py-6 rounded-[20px] border border-[#F1F5F9]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      {star <= (hoverRating || rating) ? (
                        <HiStar className="w-[42px] h-[42px] text-amber-400 drop-shadow-sm" />
                      ) : (
                        <HiOutlineStar className="w-[42px] h-[42px] text-[#CBD5E1]" />
                      )}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#64748B] mb-2 uppercase tracking-[0.08em]">Write a Review (Optional)</label>
                  <textarea rows="4" value={reviewComment} onChange={e=>setReviewComment(e.target.value)} placeholder="Describe your experience with this seller..." className="w-full px-5 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] focus:bg-white focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] outline-none transition-all resize-none text-[#0F172A] placeholder-[#94A3B8]"></textarea>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowReviewModal(false)}>Skip</Button>
                  <Button type="submit" className="flex-1 shadow-[0_4px_14px_rgba(91,75,255,0.3)]">Submit Review</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderChat;
