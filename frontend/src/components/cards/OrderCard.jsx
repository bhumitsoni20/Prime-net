import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import { HiClipboardList } from 'react-icons/hi';

const OrderCard = ({ order, action }) => {
  const statusColors = {
    placed: 'border-l-[#F59E0B]',
    preparing: 'border-l-[#5B4BFF]',
    delivered: 'border-l-[#22C55E]',
    completed: 'border-l-[#22C55E]',
    cancelled: 'border-l-[#EF4444]',
  };

  const badgeVariant = {
    paid: 'success',
    pending: 'warning',
    failed: 'danger',
  };

  return (
    <Link to={`/dashboard/orders/${order._id}`} className="block">
      <div className={`flex items-center gap-4 p-4 bg-white border border-[#E2E8F0] border-l-[3px] ${statusColors[order.orderStatus] || 'border-l-[#E2E8F0]'} rounded-[14px] hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.06)] hover:border-[#CBD5E1] transition-all duration-200`}>
        <div className="h-10 w-10 rounded-[12px] bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-center flex-shrink-0">
          <HiClipboardList className="w-[18px] h-[18px] text-[#64748B]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#0F172A] font-semibold text-sm">#{order._id?.slice(-6).toUpperCase()}</p>
          <p className="text-[#94A3B8] text-xs mt-0.5">{order.product?.title}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[#0F172A] font-bold text-sm">₹{order.amount}</p>
          <p className="text-[#94A3B8] text-[11px] mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <Badge variant={badgeVariant[order.paymentStatus] || 'default'}>
            {order.paymentStatus}
          </Badge>
          {action && <div onClick={(e) => e.preventDefault()}>{action}</div>}
        </div>
      </div>
    </Link>
  );
};

export default OrderCard;
