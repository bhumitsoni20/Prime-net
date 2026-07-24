const typeIcons = { order: '📦', payment: '💳', system: '🔐', promotion: '⭐', application: '📄' };
const typeColors = { order: 'bg-[#F3E8FF]', payment: 'bg-[#DCFCE7]', system: 'bg-[#DBEAFE]', promotion: 'bg-[#FEF3C7]', application: 'bg-[#EEF2FF]' };

const NotificationCard = ({ notification, onMarkRead }) => {
  return (
    <div
      onClick={() => !notification.isRead && onMarkRead?.(notification._id)}
      className={`flex items-start gap-3.5 p-4 rounded-[14px] border cursor-pointer transition-all duration-200 ${
        notification.isRead ? 'bg-white border-[#F1F5F9] opacity-55' : 'bg-white border-[#E2E8F0] hover:border-[#5B4BFF]/20 hover:shadow-[0_2px_8px_-2px_rgba(91,75,255,0.08)]'
      }`}
    >
      <div className={`h-10 w-10 rounded-[12px] ${typeColors[notification.type] || 'bg-[#F1F5F9]'} flex items-center justify-center flex-shrink-0 text-lg`}>
        {typeIcons[notification.type] || '🔔'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="text-[#0F172A] font-semibold text-sm">{notification.title}</h4>
          {!notification.isRead && <span className="h-2 w-2 rounded-full bg-[#5B4BFF] flex-shrink-0 animate-pulse" />}
        </div>
        <p className="text-[#64748B] text-sm">{notification.message}</p>
        <p className="text-[#94A3B8] text-[11px] mt-1.5 font-medium">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default NotificationCard;
