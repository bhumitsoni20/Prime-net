import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllOrders } from '../../services/admin.service';
import { updateOrderStatus } from '../../services/order.service';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const ManageOrders = () => {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const response = await getAllOrders(1, 100);
      return response.data || [];
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, newStatus }) => updateOrderStatus(orderId, newStatus),
    onMutate: async ({ orderId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['adminOrders'] });
      const previousOrders = queryClient.getQueryData(['adminOrders']);
      
      // Optimistically update the UI to instantly reflect the new status
      queryClient.setQueryData(['adminOrders'], (old) => 
        old?.map(order => order._id === orderId ? { ...order, orderStatus: newStatus } : order)
      );
      
      return { previousOrders };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['adminOrders'], context.previousOrders);
      toast.error('Failed to update status');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
    onSuccess: () => toast.success('Order status updated'),
  });

  const handleStatusChange = (orderId, newStatus) => {
    statusMutation.mutate({ orderId, newStatus });
  };

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
          <table className="w-full">
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
                      <div className="relative">
                        <select
                          className="w-full appearance-none bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-4 py-2 pr-8 text-[13px] font-bold text-[#334155] focus:outline-none focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={statusMutation.isPending && statusMutation.variables?.orderId === order._id}
                        >
                          <option value="placed">Placed</option>
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#94A3B8]">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                        </div>
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
