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
import { io } from 'socket.io-client';
dayjs.extend(relativeTime);

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

const Chats = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // We use the URL parameter `orderId` to track the active chat
  const selectedOrderId = orderId || null;

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL, { auth: { token } });
    
    // We can join all order rooms or just listen for a global user channel for new messages
    // Since we don't have a global user channel, we can at least fetch chats periodically or 
    // rely on the user opening a chat to mark it seen.
    
    socket.on('new_message', (msg) => {
      // Re-fetch or update chat list unread counts if we receive a global notification
      // Note: currently socket joins order rooms only when OrderChat opens.
      // To get live updates in the chat list, we would need to join all order rooms here.
      fetchChats();
    });

    // To get live updates for all chats in the list, join their rooms:
    if (chats.length > 0) {
      chats.forEach(chat => {
        socket.emit('join_order', chat.order._id);
      });
    }

    return () => socket.disconnect();
  }, [chats.length, token]);

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
    return <div className="h-[calc(100vh-80px)] flex items-center justify-center"><Spinner /></div>;
  }

  // Mobile layout state
  const isMobileChatOpen = !!selectedOrderId;

  return (
    <div className="-mx-6 lg:-mx-8 -mt-6 lg:-mt-8 h-[calc(100vh-80px)] flex bg-white overflow-hidden">
      
      {/* Left Pane - Chat List */}
      <div 
        className={`w-full md:w-96 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileChatOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="h-16 px-6 border-b border-gray-200 flex items-center shrink-0 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">Chats</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
          {chats.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No active chats.</p>
              <p className="text-sm mt-2">When you make a purchase or sell an item, your chats will appear here.</p>
            </div>
          ) : (
            chats.map((item) => {
              const { order, lastMessage, unreadCount, lastActivity } = item;
              const isSeller = order.seller?._id === user?._id;
              const otherUser = isSeller ? order.user : order.seller;
              const isActive = selectedOrderId === order._id;
              
              return (
                <div 
                  key={order._id}
                  onClick={() => handleSelectChat(order._id)}
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors mb-1 ${
                    isActive ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar src={otherUser?.avatar} name={otherUser?.name || 'User'} size="md" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-semibold text-gray-900 truncate pr-2">{otherUser?.name || 'Unknown'}</h3>
                      <span className={`text-xs whitespace-nowrap ${unreadCount > 0 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
                        {dayjs(lastActivity).fromNow(true)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {lastMessage ? lastMessage.content : `Order: ${order.product?.title || 'Unknown Product'}`}
                      </p>
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1 truncate">
                      {order.product?.title || 'Unknown Product'}
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
        className={`flex-1 bg-[#F9F9F9] flex flex-col relative overflow-hidden ${
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
              className="absolute inset-0 flex flex-col"
            >
              <OrderChat orderId={selectedOrderId} onBack={handleBack} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 hidden md:flex bg-gray-50"
            >
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">StreamKart Chats</h2>
              <p className="text-gray-500 max-w-sm">Select a conversation from the left to view messages and manage order credentials.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default Chats;
