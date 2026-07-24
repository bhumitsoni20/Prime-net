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
      <h1 className="text-[28px] font-extrabold text-[#0F172A] mb-8 tracking-[-0.02em]">My Orders</h1>
      
      {isLoading ? (
        <div className="flex justify-center p-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] rounded-[24px] p-8 text-center font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          Failed to load orders. Please try again later.
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-12 text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="h-20 w-20 bg-[#F8FAFC] rounded-[20px] border border-[#F1F5F9] flex items-center justify-center mx-auto mb-5 text-3xl shadow-sm">
            🛍️
          </div>
          <h2 className="text-[20px] font-bold text-[#0F172A] mb-2">No Orders Yet</h2>
          <p className="text-[#64748B] text-[15px] max-w-sm mx-auto">Your order history will appear here once you make your first purchase.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
