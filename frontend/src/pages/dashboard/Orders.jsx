import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Spinner from '../../components/ui/Spinner';
import OrderCard from '../../components/cards/OrderCard';
import ReviewModal from '../../components/ui/ReviewModal';
import { getMyOrders } from '../../services/order.service';
import { apiPost } from '../../services/api';
import toast from 'react-hot-toast';

const Orders = () => {
  const queryClient = useQueryClient();
  const [reviewingOrder, setReviewingOrder] = useState(null);

  const { data: rawOrders = [], isLoading, isError } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const response = await getMyOrders();
      return response.data || [];
    },
  });

  // Filter out abandoned checkouts
  const orders = rawOrders.filter((o) => o.paymentStatus === 'paid');

  const submitReview = async ({ rating, comment }) => {
    if (!rating) return toast.error('Please select a rating');
    try {
      const productId = typeof reviewingOrder.product === 'object' ? reviewingOrder.product?._id : reviewingOrder.product;
      if (!productId) return toast.error('Product no longer exists');
      await apiPost('/reviews', {
        productId,
        rating,
        comment,
      });
      toast.success('Review submitted successfully!');
      setReviewingOrder(null);
      queryClient.invalidateQueries(['myOrders']);
    } catch (err) {
      toast.error('Failed to submit review');
    }
  };

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
            <OrderCard 
              key={order._id} 
              order={order} 
              action={
                order.orderStatus === 'completed' && !order.isReviewed && order.product ? (
                  <button 
                    onClick={() => setReviewingOrder(order)}
                    className="text-[11px] font-bold text-white bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all"
                  >
                    Leave Review
                  </button>
                ) : null
              }
            />
          ))}
        </div>
      )}

      <ReviewModal 
        isOpen={!!reviewingOrder}
        onClose={() => setReviewingOrder(null)}
        onSubmit={submitReview}
        otherUserName={reviewingOrder?.seller?.name}
      />
    </div>
  );
};

export default Orders;
