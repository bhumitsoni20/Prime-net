import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPut } from '../../services/api';
import NotificationCard from '../../components/cards/NotificationCard';
import Button from '../../components/ui/Button';
import { HiOutlineCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiGet('/notifications?limit=50');
      setNotifications(res.data || []);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiPut('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await apiPut(`/notifications/${notification._id}/read`);
        setNotifications(notifications.map(n => 
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
      } catch (error) {
        console.error('Failed to mark as read', error);
      }
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-[#94A3B8] font-medium animate-pulse">Loading notifications...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[70vh]">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E2E8F0]">
        <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em]">Notifications</h1>
        {notifications.length > 0 && notifications.some(n => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="flex items-center gap-2">
            <HiOutlineCheck className="w-[18px] h-[18px]" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-12 text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="h-20 w-20 bg-[#F8FAFC] border border-[#F1F5F9] rounded-[20px] flex items-center justify-center mx-auto mb-5 shadow-sm">
            <svg className="w-10 h-10 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </div>
          <h3 className="text-[20px] font-bold text-[#0F172A] mb-2">You're all caught up!</h3>
          <p className="text-[#64748B] text-[15px] max-w-md mx-auto">No new notifications. You'll receive alerts for orders, reviews, and system updates here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification._id} 
              onClick={() => handleNotificationClick(notification)}
              className={`cursor-pointer transition-all duration-300 ${!notification.isRead ? 'ring-2 ring-[#5B4BFF]/20 rounded-[14px] shadow-[0_4px_12px_rgba(91,75,255,0.08)]' : ''}`}
            >
              <NotificationCard 
                notification={notification} 
                onMarkRead={() => handleNotificationClick(notification)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
