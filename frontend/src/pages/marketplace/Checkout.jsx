import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { HiShieldCheck, HiLockClosed } from 'react-icons/hi';
import useCart from '../../hooks/useCart';
import useAuthStore from '../../store/authStore';
import { createRazorpayOrder, openRazorpayCheckout, verifyRazorpayPayment } from '../../services/payment.service';
import { apiPost } from '../../services/api';
import toast from 'react-hot-toast';
import PaymentSuccessAnimation from '../../components/ui/PaymentSuccessAnimation';

const Checkout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successOrderIds, setSuccessOrderIds] = useState([]);
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
            
            setSuccessOrderIds(orderIds);
            setShowSuccess(true);
            clearCart();
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

  const handleSuccessComplete = () => {
    if (successOrderIds.length === 1) {
      navigate(`/dashboard/chats/${successOrderIds[0]}`);
    } else {
      toast.success('Orders created successfully!');
      navigate('/dashboard/chats');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {showSuccess && <PaymentSuccessAnimation onComplete={handleSuccessComplete} />}
      
      {/* Top bar */}
      <div className="flex items-center justify-between mb-10 pb-5 border-b border-[#F1F5F9]">
        <Link to="/" className="text-[22px] font-extrabold text-[#0F172A] tracking-tight"><span className="text-[#5B4BFF]">Stream</span>Kart</Link>
        <div className="flex items-center gap-2 text-[#64748B] text-[13px] font-semibold tracking-wide uppercase"><HiLockClosed className="w-4 h-4 text-[#5B4BFF]" /> Secure Checkout</div>
        <Link to="/cart" className="text-[14px] text-[#64748B] hover:text-[#0F172A] font-medium transition-colors">Return to Cart</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left — Payment Info */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] p-10 flex flex-col items-center justify-center text-center min-h-[440px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[#5B4BFF]/20 rounded-[24px] blur-[16px] animate-pulse" />
              <div className="relative h-20 w-20 bg-gradient-to-br from-[#5B4BFF] to-[#7C3AED] text-white rounded-[24px] flex items-center justify-center shadow-[0_8px_24px_rgba(91,75,255,0.35)]">
                <HiShieldCheck className="w-10 h-10" />
              </div>
            </div>
            
            <h2 className="text-[26px] font-extrabold text-[#0F172A] mb-3 tracking-[-0.02em]">Checkout Securely with Razorpay</h2>
            <p className="text-[#64748B] max-w-md mb-10 leading-relaxed text-[15px]">
              Click the button on the right to open the secure Razorpay payment gateway. You can pay effortlessly via UPI, Credit/Debit Cards, or Net Banking.
            </p>
            
            <div className="flex items-center justify-center gap-8 text-[13px] text-[#64748B] font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#E2E8F0] shadow-sm"><HiShieldCheck className="w-4 h-4 text-[#22C55E]" /> PCI DSS Compliant</span>
              <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#E2E8F0] shadow-sm"><HiLockClosed className="w-4 h-4 text-[#5B4BFF]" /> 256-bit SSL</span>
            </div>
          </div>
        </div>

        {/* Right — Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 lg:p-10 sticky top-24 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED]" />
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-8">Order Summary</h2>

            {cartItems.length === 0 ? (
              <p className="text-[#94A3B8] text-sm mb-6 pb-6 border-b border-[#F1F5F9]">Your cart is empty.</p>
            ) : (
              <div className="space-y-5 mb-8 pb-8 border-b border-[#F1F5F9]">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-[14px] bg-[#F8FAFC] border border-[#F1F5F9] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                      {item.logo ? (
                        <img src={item.logo} alt={item.title} className="max-h-full max-w-full object-contain p-2" />
                      ) : (
                        <span className="text-[#94A3B8] font-extrabold text-xl">{item.title?.[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#0F172A] font-bold text-[15px] truncate mb-0.5">{item.title}</p>
                      <p className="text-[#64748B] text-[13px] font-medium">Qty: 1</p>
                    </div>
                    <p className="text-[#0F172A] font-extrabold text-[15px]">₹{item.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4 mb-8 pb-8 border-b border-[#F1F5F9] text-[15px]">
              <div className="flex justify-between"><span className="text-[#64748B] font-medium">Subtotal</span><span className="text-[#0F172A] font-semibold">₹{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[#64748B] font-medium">Platform Fee (2%)</span><span className="text-[#0F172A] font-semibold">₹{platformFee.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-[#64748B] font-medium">Taxes</span><span className="text-[#0F172A] font-semibold">₹0.00</span></div>
            </div>

            <div className="flex justify-between items-baseline mb-8">
              <span className="text-[#0F172A] font-bold text-[17px]">Total</span>
              <div className="text-right">
                <p className="text-[#0F172A] font-extrabold text-[32px] tracking-[-0.02em] leading-none mb-1">₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-[#94A3B8] text-[11px] font-bold tracking-[0.08em]">BILLED IN INR</p>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full mb-5 py-4 text-[17px] shadow-[0_4px_14px_rgba(91,75,255,0.4)]" 
              onClick={handlePayment} 
              disabled={isProcessing || cartItems.length === 0}
            >
              {isProcessing ? 'Processing securely...' : 'Pay securely with Razorpay'}
            </Button>
            
            <p className="text-[12px] text-[#94A3B8] text-center leading-relaxed">
              By confirming your purchase, you agree to the <Link to="/terms" className="text-[#5B4BFF] hover:underline font-medium">Terms of Service</Link>.
            </p>

            {/* Guarantee */}
            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-[#F1F5F9]">
              <div className="h-10 w-10 rounded-[12px] bg-[#F0FDF4] flex items-center justify-center flex-shrink-0 border border-[#BBF7D0]">
                <HiShieldCheck className="w-[18px] h-[18px] text-[#15803D]" />
              </div>
              <div>
                <p className="text-[#0F172A] font-bold text-[13px]">StreamKart Money-Back Guarantee</p>
                <p className="text-[#64748B] text-[12px] mt-0.5">Full refund within 30 days if not satisfied.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
