import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { HiShieldCheck, HiLockClosed } from 'react-icons/hi';
import useCart from '../../hooks/useCart';
import useAuthStore from '../../store/authStore';
import { createRazorpayOrder, openRazorpayCheckout, verifyRazorpayPayment } from '../../services/payment.service';
import { apiPost } from '../../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { items: cartItems, total: subtotal, clearCart } = useCart();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const platformFee = subtotal * 0.02;
  const total = subtotal + platformFee;

  const handlePayment = async () => {
    if (cartItems.length === 0) return toast.error('Your cart is empty');

    try {
      setIsProcessing(true);

      // 1. Create Razorpay order via backend (for all items)
      const productIds = cartItems.map(item => item._id);
      const { data: rzpOrder } = await createRazorpayOrder(productIds);

      // 2. Create pending DB orders for all items
      const orderPromises = cartItems.map(item => 
        apiPost('/orders', {
          productId: item._id,
          paymentMethod: 'razorpay'
        })
      );
      const dbOrdersResponses = await Promise.all(orderPromises);
      const orderIds = dbOrdersResponses.map(res => res.data._id);

      // 3. Open Razorpay Checkout Modal
      openRazorpayCheckout(
        rzpOrder,
        user,
        async (response) => {
          try {
            // 4. Verify payment with backend for all orders
            await verifyRazorpayPayment({
              ...response,
              orderIds: orderIds
            });
            
            toast.success('Payment successful!');
            clearCart();
            navigate('/dashboard/orders');
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setIsProcessing(false);
          }
        },
        (errorMsg) => {
          toast.error(errorMsg);
          setIsProcessing(false);
        }
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <Link to="/" className="text-xl font-bold text-gray-900"><span className="text-indigo-600">Stream</span>kart</Link>
        <div className="flex items-center gap-2 text-gray-500 text-sm"><HiLockClosed className="w-4 h-4" /> Secure Checkout</div>
        <Link to="/products" className="text-sm text-gray-500 hover:text-gray-700">Cancel</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left — Payment Info */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
            <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <HiShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Checkout Securely with Razorpay</h2>
            <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
              Click the button on the right to open the secure Razorpay payment gateway. You can pay effortlessly via UPI, Credit/Debit Cards, or Net Banking.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400 font-medium">
              <span className="flex items-center gap-2"><HiShieldCheck className="w-5 h-5 text-green-500" /> PCI DSS Compliant</span>
              <span className="flex items-center gap-2"><HiLockClosed className="w-5 h-5 text-indigo-500" /> 256-bit SSL</span>
            </div>
          </div>
        </div>

        {/* Right — Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

            {cartItems.length === 0 ? (
              <p className="text-gray-500 text-sm mb-5 pb-5 border-b border-gray-100">Your cart is empty.</p>
            ) : (
              cartItems.map((item) => (
                <div key={item._id} className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
                  <div className="h-14 w-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                    {item.logo ? (
                      <img src={item.logo} alt={item.title} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-gray-400 font-bold text-lg">{item.title?.[0]}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-semibold text-sm">{item.title}</p>
                    <p className="text-gray-500 text-xs">Qty: 1</p>
                  </div>
                  <p className="text-gray-900 font-bold">₹{item.price}</p>
                </div>
              ))
            )}

            <div className="space-y-3 mb-5 pb-5 border-b border-gray-100 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="text-gray-900">₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Platform Fee (2%)</span><span className="text-gray-900">₹{platformFee.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Taxes</span><span className="text-gray-900">₹0.00</span></div>
            </div>

            <div className="flex justify-between items-baseline mb-5">
              <span className="text-gray-900 font-bold text-lg">Total</span>
              <div className="text-right">
                <p className="text-indigo-600 font-bold text-2xl">₹{total.toFixed(2)}</p>
                <p className="text-gray-400 text-xs">Billed in INR</p>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full mb-3" 
              onClick={handlePayment} 
              disabled={isProcessing || cartItems.length === 0}
            >
              {isProcessing ? 'Processing...' : 'Complete Purchase'}
            </Button>
            <p className="text-xs text-gray-400 text-center">By clicking 'Complete Purchase', you agree to our <Link to="/terms" className="text-indigo-600 underline">Terms of Service</Link> and <Link to="/privacy" className="text-indigo-600 underline">Privacy Policy</Link>.</p>

            {/* Guarantee */}
            <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100 bg-gray-50 rounded-xl p-4 -mx-2">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <HiShieldCheck className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-gray-900 font-semibold text-sm">Streamkart Money-Back Guarantee</p>
                <p className="text-gray-500 text-xs">Full refund within 30 days if not satisfied.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
