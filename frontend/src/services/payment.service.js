import { apiPost } from './api';

// ─── Razorpay ───────────────────────────────────────────

export const createRazorpayOrder = (payload) =>
  apiPost('/payments/razorpay/create-order', payload);

export const verifyRazorpayPayment = (data) =>
  apiPost('/payments/razorpay/verify', data);

export const openRazorpayCheckout = (order, user, onSuccess, onError) => {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: 'Streamkart',
    description: 'Digital Subscription Purchase',
    order_id: order.orderId,
    prefill: {
      name: user?.name || '',
      email: user?.email || '',
      contact: user?.phone || '',
    },
    theme: { color: '#3b82f6' },
    handler: onSuccess,
    modal: { ondismiss: () => onError?.('Payment cancelled') },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};


