import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet } from '../../services/api';
import useAuthStore from '../../store/authStore';
import OrderChat from './OrderChat';
import Avatar from '../../components/ui/Avatar';
import Spinner from '../../components/ui/Spinner';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useSocket } from '../../context/SocketContext';

const Chats = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { socket, getPresence } = useSocket();
  
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // We use the URL parameter `orderId` to track the active chat
  const selectedOrderId = orderId || null;

  useEffect(() => {
    fetchChats();

    const handleFocus = () => {
      fetchChats();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [orderId]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = () => {
      fetchChats();
    };

    socket.on('new_message', handleNewMessage);
    socket.on('messages_seen', handleNewMessage);
    socket.on('order_updated', handleNewMessage);
    socket.on('payment_verified_redirect', handleNewMessage);

    if (chats.length > 0) {
      chats.forEach((chat) => {
        socket.emit('join_order', chat.order._id);
      });
    }

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('messages_seen', handleNewMessage);
      socket.off('order_updated', handleNewMessage);
      socket.off('payment_verified_redirect', handleNewMessage);
    };
  }, [chats.length, socket]);

  const fetchChats = async () => {
    try {
      const res = await apiGet('/orders/chats');
      setChats(res.data);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChat = (id) => {
    navigate(`/dashboard/chats/${id}`);
  };

  const handleBack = () => {
    navigate('/dashboard/chats');
  };

  if (isLoading) {
    return <div className="h-[calc(100vh-80px)] flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  // Mobile layout state
  const isMobileChatOpen = !!selectedOrderId;

  return (
    <div className="-mx-6 lg:-mx-8 -mt-6 lg:-mt-8 h-[calc(100vh-80px)] flex bg-white overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border-t border-[#E2E8F0]">
      
      {/* Left Pane - Chat List */}
      <div 
        className={`w-full md:w-80 lg:w-72 xl:w-80 flex-shrink-0 border-r border-[#E2E8F0] bg-white flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileChatOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="h-[72px] px-6 border-b border-[#E2E8F0] flex items-center shrink-0 bg-[#F8FAFC]">
          <h2 className="text-[20px] font-extrabold text-[#0F172A] tracking-[-0.02em]">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar bg-[#F1F5F9]/30">
          {chats.length === 0 ? (
            <div className="p-10 text-center text-[#64748B] flex flex-col items-center">
              <div className="w-16 h-16 bg-[#F8FAFC] rounded-[16px] flex items-center justify-center mb-4 border border-[#F1F5F9] shadow-sm">
                <span className="text-2xl opacity-50">💬</span>
              </div>
              <p className="font-bold text-[#0F172A]">No active chats</p>
              <p className="text-[13px] mt-2 leading-relaxed">When you make a purchase or sell an item, your chats will appear here.</p>
            </div>
          ) : (
            chats.map((item) => {
              const { order, lastMessage, unreadCount, lastActivity } = item;
              const sellerIdStr = (order.seller?._id || order.seller)?.toString();
              const userIdStr = user?._id?.toString();
              const isSeller = sellerIdStr && userIdStr && sellerIdStr === userIdStr;
              const otherUser = isSeller ? order.user : order.seller;
              const isActive = selectedOrderId && order._id && selectedOrderId.toString() === order._id.toString();
              const presence = getPresence(otherUser?._id);
              const productTitle = order.product?.title || order.bundle?.title || (order.isBundle ? 'Bundle Order' : 'Product');
              
              return (
                <div 
                  key={order._id}
                  onClick={() => handleSelectChat(order._id)}
                  className={`flex items-center gap-4 p-3.5 rounded-[16px] cursor-pointer transition-all duration-200 mb-1.5 ${
                    isActive ? 'bg-white border border-[#5B4BFF]/20 shadow-[0_2px_8px_rgba(91,75,255,0.08)]' : 'bg-transparent border border-transparent hover:bg-white hover:border-[#E2E8F0] hover:shadow-sm'
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar src={otherUser?.avatar} name={otherUser?.name || 'User'} size="md" className="ring-2 ring-white shadow-sm" />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${presence.status === 'online' ? 'bg-[#10B981]' : 'bg-[#CBD5E1]'}`} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#EF4444] text-white text-[10px] font-extrabold h-[22px] w-[22px] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`font-bold truncate pr-2 text-[15px] ${isActive ? 'text-[#0F172A]' : 'text-[#334155]'}`}>{otherUser?.name || 'Unknown'}</h3>
                      <span className={`text-[11px] whitespace-nowrap font-medium ${unreadCount > 0 ? 'text-[#5B4BFF] font-bold' : 'text-[#94A3B8]'}`}>
                        {dayjs(lastActivity).fromNow(true)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[13px] truncate ${unreadCount > 0 ? 'text-[#0F172A] font-semibold' : 'text-[#64748B]'}`}>
                        {lastMessage ? lastMessage.content : `Order: ${productTitle}`}
                      </p>
                    </div>
                    <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-[0.08em] mt-1.5 truncate">
                      {productTitle}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane - Chat Window */}
      <div 
        className={`flex-1 bg-[#F8FAFC] flex flex-col relative overflow-hidden ${
          !isMobileChatOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        <AnimatePresence mode="wait">
          {selectedOrderId ? (
            <motion.div
              key={selectedOrderId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col bg-white"
            >
              <OrderChat orderId={selectedOrderId} onBack={handleBack} onMessageSent={fetchChats} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 hidden md:flex bg-[#F8FAFC]"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-[#5B4BFF]/20 rounded-full blur-[24px] animate-pulse" />
                <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-[#E2E8F0]">
                  <svg className="w-10 h-10 text-[#5B4BFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-[24px] font-bold text-[#0F172A] mb-2 tracking-[-0.02em]">StreamKart Messages</h2>
              <p className="text-[#64748B] text-[15px] max-w-sm leading-relaxed">Select a conversation from the left to view messages and manage order credentials.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default Chats;
