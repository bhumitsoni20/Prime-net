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
      <h1 className="text-xl font-bold text-gray-900 mb-6">Seller Orders</h1>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="p-4">Order ID</th>
                <th className="p-4">Product</th>
                <th className="p-4">Buyer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500 animate-pulse">Loading orders...</td></tr>
              ) : isError ? (
                <tr><td colSpan={6} className="p-8 text-center text-red-500">Failed to load orders.</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500 text-sm">Orders will appear once customers purchase your products</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-xs font-mono text-gray-500">#{order._id.substring(0,8).toUpperCase()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                          {order.product?.logo ? <img src={order.product.logo} className="max-h-full max-w-full object-contain" alt="" /> : order.product?.title?.[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-900 line-clamp-1">{order.product?.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{order.user?.name || order.user?.email || 'Guest'}</td>
                    <td className="p-4 text-sm font-bold text-gray-900">₹{order.amount}</td>
                    <td className="p-4">
                      <Badge variant={order.orderStatus === 'delivered' ? 'success' : order.orderStatus === 'cancelled' ? 'danger' : 'warning'}>
                        {order.orderStatus || 'placed'}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{dayjs(order.createdAt).format('MMM DD, YYYY')}</td>
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
