import { useNavigate } from 'react-router-dom';
import { HiCreditCard, HiShoppingBag, HiBell, HiTag, HiClipboardList, HiInformationCircle } from 'react-icons/hi';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'payment':
      return <HiCreditCard className="w-5 h-5 text-emerald-600" />;
    case 'order':
      return <HiShoppingBag className="w-5 h-5 text-purple-600" />;
    case 'promotion':
      return <HiTag className="w-5 h-5 text-amber-600" />;
    case 'application':
      return <HiClipboardList className="w-5 h-5 text-indigo-600" />;
    case 'system':
      return <HiBell className="w-5 h-5 text-blue-600" />;
    default:
      return <HiInformationCircle className="w-5 h-5 text-slate-600" />;
  }
};

const typeColors = {
  order: 'bg-[#F3E8FF] border border-purple-200',
  payment: 'bg-[#DCFCE7] border border-emerald-200',
  system: 'bg-[#DBEAFE] border border-blue-200',
  promotion: 'bg-[#FEF3C7] border border-amber-200',
  application: 'bg-[#EEF2FF] border border-indigo-200',
};

const NotificationCard = ({ notification, onMarkRead }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onMarkRead) {
      onMarkRead();
    }
  };

  const formattedMessage = (notification?.message || '').replace(/\?(\d)/g, '₹$1');

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3.5 p-4 rounded-[16px] border cursor-pointer transition-all duration-200 ${
        notification.isRead
          ? 'bg-white border-[#F1F5F9] opacity-60'
          : 'bg-white border-[#E2E8F0] shadow-sm hover:border-[#5B4BFF]/30 hover:shadow-[0_4px_12px_-2px_rgba(91,75,255,0.08)]'
      }`}
    >
      <div
        className={`h-11 w-11 rounded-[14px] ${
          typeColors[notification.type] || 'bg-[#F1F5F9] border border-slate-200'
        } flex items-center justify-center flex-shrink-0 shadow-xs`}
      >
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`text-sm font-bold ${notification.isRead ? 'text-[#334155]' : 'text-[#0F172A]'}`}>
            {notification.title}
          </h4>
          {!notification.isRead && (
            <span className="h-2 w-2 rounded-full bg-[#5B4BFF] flex-shrink-0 animate-pulse" />
          )}
        </div>
        <p className="text-[#64748B] text-sm leading-relaxed">{formattedMessage}</p>
        <p className="text-[#94A3B8] text-[11px] mt-1.5 font-semibold">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default NotificationCard;
