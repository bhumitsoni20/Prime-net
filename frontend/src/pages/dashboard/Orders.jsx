import { useQuery } from '@tanstack/react-query';
import Spinner from '../../components/ui/Spinner';
import OrderCard from '../../components/cards/OrderCard';
import { getMyOrders } from '../../services/order.service';

const Orders = () => {
  const { data: rawOrders = [], isLoading, isError } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const response = await getMyOrders();
      return response.data || [];
    },
  });

  // Filter out abandoned checkouts
  const orders = rawOrders.filter((o) => o.paymentStatus === 'paid');

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">My Orders</h1>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6 text-center">
          Failed to load orders. Please try again later.
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            🛍️
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">No Orders Yet</h2>
          <p className="text-gray-500 text-sm">Your order history will appear here once you make your first purchase.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
