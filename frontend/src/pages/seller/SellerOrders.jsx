import { useQuery } from '@tanstack/react-query';
import { getSellerOrders } from '../../services/order.service';
import Badge from '../../components/ui/Badge';
import dayjs from 'dayjs';

const SellerOrders = () => {
  const { data: rawOrders = [], isLoading, isError } = useQuery({
    queryKey: ['sellerOrders'],
    queryFn: async () => {
      const response = await getSellerOrders();
      return response.data || [];
    },
  });

  // Only show orders where payment was completed
  const orders = rawOrders.filter(o => o.paymentStatus === 'paid');

  return (
    <div>
      <h1 className="text-[28px] font-extrabold text-[#0F172A] mb-8 tracking-[-0.02em]">Customer Orders</h1>
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-left text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] bg-[#F8FAFC]">
                <th className="p-5 pl-6">Order ID</th>
                <th className="p-5">Product</th>
                <th className="p-5">Buyer</th>
                <th className="p-5 text-right">Amount</th>
                <th className="p-5">Status</th>
                <th className="p-5 pr-6 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr><td colSpan={6} className="p-12 text-center text-[#94A3B8] font-medium animate-pulse">Loading orders...</td></tr>
              ) : isError ? (
                <tr><td colSpan={6} className="p-12 text-center text-[#EF4444] font-medium bg-[#FEF2F2]">Failed to load orders.</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-[#64748B] font-medium text-[15px]">Orders will appear once customers purchase your products.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="p-5 pl-6 text-[13px] font-mono font-medium text-[#94A3B8]">#{order._id.substring(0,8).toUpperCase()}</td>
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-[12px] bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#5B4BFF] font-extrabold text-lg flex-shrink-0 shadow-sm overflow-hidden p-1">
                          {order.product?.logo ? <img src={order.product.logo} className="w-full h-full object-contain" alt="" /> : order.product?.title?.[0]}
                        </div>
                        <span className="text-[14px] font-bold text-[#0F172A] line-clamp-1 group-hover:text-[#5B4BFF] transition-colors">{order.product?.title}</span>
                      </div>
                    </td>
                    <td className="p-5 text-[14px] font-medium text-[#475569]">{order.user?.name || order.user?.email || 'Guest'}</td>
                    <td className="p-5 text-[15px] font-extrabold text-[#0F172A] text-right">₹{order.amount.toLocaleString()}</td>
                    <td className="p-5">
                      <Badge variant={order.orderStatus === 'delivered' ? 'success' : order.orderStatus === 'cancelled' ? 'danger' : 'warning'}>
                        {order.orderStatus || 'placed'}
                      </Badge>
                    </td>
                    <td className="p-5 pr-6 text-[13px] font-medium text-[#64748B] text-right">{dayjs(order.createdAt).format('MMM DD, YYYY')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerOrders;
