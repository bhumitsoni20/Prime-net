import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PaymentSuccessAnimation from '../../components/ui/PaymentSuccessAnimation';
import useCart from '../../hooks/useCart';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const orderIds = searchParams.get('orders')?.split(',') || [];

  useEffect(() => {
    // We assume Stripe succeeded if we landed here, so clear the cart.
    // The actual payment verification happens via Stripe webhooks.
    clearCart();
  }, [clearCart]);

  const handleComplete = () => {
    if (orderIds.length === 1) {
      navigate(`/dashboard/chats/${orderIds[0]}`);
    } else {
      navigate('/dashboard/chats');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
      <PaymentSuccessAnimation onComplete={handleComplete} />
    </div>
  );
};

export default PaymentSuccess;
