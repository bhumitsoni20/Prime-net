import { useQuery } from '@tanstack/react-query';
import { getAllOrders } from '../../services/admin.service';
import dayjs from 'dayjs';

const ManageOrders = () => {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const response = await getAllOrders(1, 100);
      return response.data || [];
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em] mb-1">Manage Orders</h1>
          <p className="text-[#64748B] text-[15px]">View and update all platform orders.</p>
        </div>
      </div>
      
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-left text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] bg-[#F8FAFC]">
                <th className="p-5 pl-6">Order ID</th>
                <th className="p-5">User</th>
                <th className="p-5">Product</th>
                <th className="p-5 text-right">Amount</th>
                <th className="p-5">Date</th>
                <th className="p-5 pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr><td colSpan={6} className="p-12 text-center text-[#94A3B8] font-medium animate-pulse">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-[#64748B] font-medium bg-[#F8FAFC]">No orders found.</td></tr>
              ) : (
                orders.map(order => (
                  <tr key={order._id} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="p-5 pl-6 text-[13px] font-mono font-medium text-[#94A3B8] group-hover:text-[#5B4BFF] transition-colors">#{order._id.substring(0, 8)}</td>
                    <td className="p-5 text-[14px] font-semibold text-[#0F172A]">{order.user?.email || 'Unknown'}</td>
                    <td className="p-5 text-[14px] font-medium text-[#475569]">{order.product?.title || 'Unknown Product'}</td>
                    <td className="p-5 text-[15px] font-extrabold text-[#0F172A] text-right">₹{(order.amount || order.totalAmount || 0).toLocaleString()}</td>
                    <td className="p-5 text-[13px] font-medium text-[#64748B]">{dayjs(order.createdAt).format('MMM DD, YYYY')}</td>
                    <td className="p-5 pr-6">
                      <div className={`inline-flex px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] shadow-sm border ${
                        order.orderStatus === 'delivered' ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]' : 
                        order.orderStatus === 'completed' ? 'bg-[#EEF2FF] text-[#5B4BFF] border-[#C7D2FE]' :
                        order.orderStatus === 'cancelled' ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]' :
                        'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                      }`}>
                        {order.orderStatus}
                      </div>
                    </td>
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

export default ManageOrders;
