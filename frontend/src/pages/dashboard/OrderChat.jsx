import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import useAuthStore from '../../store/authStore';
import { apiGet, apiPost, apiPut } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  HiPaperAirplane, HiPhotograph, HiPaperClip, HiEmojiHappy, 
  HiChevronLeft, HiDotsVertical, HiCheckCircle, HiClock, 
  HiShieldCheck, HiOutlineDocumentDownload, HiOutlineExclamationCircle 
} from 'react-icons/hi';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

const OrderChat = ({ orderId: orderIdProp, onBack }) => {
  const params = useParams();
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
      setOrder(prev => ({ ...prev, ...updatedOrder }));
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
      setShowCredentialsModal(false);
    } catch (err) {
      toast.error('Failed to deliver credentials');
    }
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center"><Spinner /></div>;
  if (!order) return <div className="p-8 text-center flex-1 flex items-center justify-center">Order not found</div>;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden font-sans h-full">
      {/* Top Navbar */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack || (() => window.history.back())} className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden">
            <HiChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          {!onBack && (
            <Link to="/dashboard/orders" className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:block">
              <HiChevronLeft className="w-6 h-6 text-gray-600" />
            </Link>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
              {order.product?.logo ? <img src={order.product.logo} className="w-full h-full object-cover"/> : <span className="font-bold text-gray-400">{order.product?.title?.[0] || '?'}</span>}
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight truncate max-w-xs">{order.product?.title || 'Unknown Product'}</h1>
              <div className="text-xs text-gray-500 font-medium">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' : 
            order.orderStatus === 'completed' ? 'bg-indigo-100 text-indigo-700' :
            'bg-amber-100 text-amber-700'
          }`}>
            {order.orderStatus}
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full"><HiDotsVertical className="w-5 h-5 text-gray-500"/></button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Context (Hidden on small screens) */}
        <aside className="w-80 bg-white border-r border-gray-200 flex-shrink-0 hidden lg:flex flex-col p-6 overflow-y-auto">
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Conversation With</h3>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                {otherUser?.name?.[0] || 'U'}
              </div>
              <div>
                <div className="font-bold text-gray-900">{otherUser?.name}</div>
                <div className="text-xs text-gray-500">{isSeller ? 'Buyer' : 'Seller'}</div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Delivery Timer</h3>
            <div className="p-5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <div className="flex items-center gap-2 mb-2 text-indigo-100 text-sm">
                <HiClock className="w-5 h-5" /> Estimated Delivery
              </div>
              <div className="text-2xl font-bold tracking-tight">
                {order.orderStatus === 'delivered' || order.orderStatus === 'completed' ? 'Delivered' : 'In Progress'}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Order Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-gray-500">Amount</span><span className="font-bold text-gray-900">₹{order.amount}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-gray-500">Date</span><span className="font-medium text-gray-900">{dayjs(order.createdAt).format('MMM D, YYYY')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="font-medium text-gray-900 capitalize">{order.paymentMethod}</span></div>
            </div>
          </div>
        </aside>

        {/* Center - Chat Area */}
        <main className="flex-1 flex flex-col bg-gray-50/50 relative">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, idx) => {
              const isMine = msg.senderId._id === user._id;
              
              if (msg.type === 'system') {
                return (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} key={msg._id} className="flex justify-center my-6">
                    <div className="bg-gray-200/60 text-gray-600 text-xs py-1.5 px-4 rounded-full font-medium">
                      {msg.content}
                    </div>
                  </motion.div>
                )
              }

              if (msg.type === 'credentials') {
                return (
                  <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className="w-full max-w-sm bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
                      <div className="flex items-center gap-3 mb-4 border-b border-indigo-500/30 pb-4">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"><HiShieldCheck className="w-6 h-6 text-green-400"/></div>
                        <div>
                          <h4 className="font-bold">Secure Delivery</h4>
                          <p className="text-xs text-indigo-200">Credentials have been delivered</p>
                        </div>
                      </div>
                      
                      {!isMine && order.credentials && (
                        <div className="space-y-3 bg-black/20 p-4 rounded-xl font-mono text-sm">
                          <div><span className="text-indigo-300 text-xs block mb-1">Email / Username</span>{order.credentials.email}</div>
                          <div><span className="text-indigo-300 text-xs block mb-1">Password</span>{order.credentials.password}</div>
                          {order.credentials.notes && <div><span className="text-indigo-300 text-xs block mb-1">Notes</span>{order.credentials.notes}</div>}
                        </div>
                      )}
                      {isMine && (
                        <div className="text-center text-sm text-indigo-200 italic mt-2">You have sent the credentials securely.</div>
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
                  <div className={`flex max-w-[70%] ${isMine ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500">
                      {msg.senderId.name[0]}
                    </div>
                    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-3 rounded-2xl ${isMine ? 'bg-indigo-600 text-white rounded-tr-sm shadow-indigo-200/50' : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'} shadow-sm`}>
                        <p className="text-[15px] leading-relaxed">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-400 font-medium">
                        {dayjs(msg.createdAt).format('h:mm A')}
                        {isMine && (
                          <span className="ml-1">
                            {msg.status === 'seen' ? <HiCheckCircle className="w-3.5 h-3.5 text-indigo-500"/> : <HiCheckCircle className="w-3.5 h-3.5 text-gray-300"/>}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {otherUserTyping && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex gap-3 items-center text-gray-400 text-sm font-medium">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">{otherUser?.name?.[0]}</div>
                <div className="bg-white px-4 py-3 rounded-2xl border border-gray-100 shadow-sm flex gap-1 items-center h-10">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={sendMessage} className="flex items-center gap-3">
              <button type="button" className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <HiPaperClip className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-full pl-5 pr-12 py-3.5 text-sm transition-all"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-500">
                  <HiEmojiHappy className="w-5 h-5" />
                </button>
              </div>
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 transition-all active:scale-95"
              >
                <HiPaperAirplane className="w-5 h-5 transform rotate-90 ml-1" />
              </button>
            </form>
          </div>
        </main>

        {/* Right Sidebar - Actions */}
        <aside className="w-80 bg-white border-l border-gray-200 flex-shrink-0 flex flex-col p-6 overflow-y-auto">
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Order Timeline</h3>
            <div className="space-y-5">
              {['placed', 'preparing', 'delivered', 'completed'].map((step, idx) => {
                const stepIndex = ['placed', 'preparing', 'delivered', 'completed'].indexOf(order.orderStatus);
                const isPassed = idx <= stepIndex;
                const isCurrent = idx === stepIndex;
                return (
                  <div key={step} className="flex gap-4 relative">
                    {idx < 3 && <div className={`absolute left-3.5 top-8 bottom-[-20px] w-0.5 ${isPassed && !isCurrent ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 ${isPassed ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                      {isPassed ? <HiCheckCircle className="w-4 h-4"/> : <div className="w-2 h-2 rounded-full bg-gray-300"></div>}
                    </div>
                    <div className={`flex-1 ${isPassed ? 'opacity-100' : 'opacity-40'}`}>
                      <p className={`text-sm font-bold capitalize ${isPassed ? 'text-gray-900' : 'text-gray-500'}`}>{step}</p>
                      {isCurrent && <p className="text-xs text-indigo-600 font-medium mt-0.5">Current Phase</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-auto space-y-3">
            {isSeller && order.orderStatus !== 'delivered' && order.orderStatus !== 'completed' && (
              <Button className="w-full shadow-lg shadow-indigo-200" onClick={() => setShowCredentialsModal(true)}>
                <HiShieldCheck className="w-5 h-5 mr-2" /> Secure Deliver Order
              </Button>
            )}
            {!isSeller && order.orderStatus === 'delivered' && (
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
                Confirm & Complete
              </Button>
            )}
            <Button variant="secondary" className="w-full">
              <HiOutlineDocumentDownload className="w-5 h-5 mr-2" /> Download Invoice
            </Button>
            <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
              <HiOutlineExclamationCircle className="w-5 h-5 mr-2" /> Report Issue
            </Button>
          </div>
        </aside>
      </div>

      {/* Credentials Modal */}
      <AnimatePresence>
        {showCredentialsModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-100"
            >
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <HiShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Deliver Credentials</h2>
              <p className="text-center text-gray-500 text-sm mb-8">Enter the secure delivery details below. These will be encrypted and sent to the buyer.</p>
              
              <form onSubmit={deliverCredentials} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email / Username</label>
                  <input type="text" required value={credEmail} onChange={e=>setCredEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                  <input type="text" required value={credPassword} onChange={e=>setCredPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Notes (Optional)</label>
                  <textarea rows="3" value={credNotes} onChange={e=>setCredNotes(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"></textarea>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowCredentialsModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1">Send Securely</Button>
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
