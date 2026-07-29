import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineTrash, HiShoppingCart, HiArrowRight } from 'react-icons/hi';
import useCartStore from '../../store/cartStore';
import Button from '../../components/ui/Button';

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const navigate = useNavigate();

  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 animate-scaleIn">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#5B4BFF]/20 rounded-full blur-[20px] animate-pulse" />
          <div className="relative h-28 w-28 bg-white border border-[#E2E8F0] rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.06)]">
            <HiShoppingCart className="w-12 h-12 text-[#94A3B8]" />
          </div>
        </div>
        <h2 className="text-[28px] font-extrabold text-[#0F172A] mb-2 tracking-[-0.02em]">Your cart is empty</h2>
        <p className="text-[#64748B] text-[15px] mb-8 max-w-sm text-center leading-relaxed">Looks like you haven't added any premium digital subscriptions to your cart yet.</p>
        <Link to="/products">
          <Button size="lg" className="px-8 shadow-[0_4px_14px_rgba(91,75,255,0.3)]">Explore Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-[32px] font-extrabold text-[#0F172A] mb-8 tracking-[-0.02em]">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-8 space-y-5">
          {items.map((item) => (
            <div key={item._id} className="bg-white border border-[#E2E8F0] rounded-[24px] p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow">
              <div className="h-28 w-28 bg-[#F8FAFC] border border-[#F1F5F9] rounded-[20px] flex items-center justify-center flex-shrink-0 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                {item.logo || item.thumbnail ? (
                  <img src={item.logo || item.thumbnail} alt={item.title} className="w-full h-full object-cover p-2" />
                ) : (
                  <span className="text-[#5B4BFF] text-3xl font-extrabold">{item.title?.charAt(0)}</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0 w-full">
                <Link to={item.bundlePrice ? `/bundles/${item._id}` : `/products/${item._id}`} className="text-xl font-bold text-[#0F172A] hover:text-[#5B4BFF] transition-colors line-clamp-1 mb-1">
                  {item.title}
                </Link>
                <p className="text-[13px] font-medium text-[#94A3B8] capitalize mb-5">{item.category?.replace('-', ' ')}</p>
                
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <div className="flex items-center border border-[#E2E8F0] rounded-[12px] bg-white">
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="px-3.5 py-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-l-[12px] transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 border-x border-[#E2E8F0] text-[13px] font-semibold w-12 text-center text-[#0F172A]">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="px-3.5 py-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-r-[12px] transition-colors"
                    >
                      +
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeItem(item._id)}
                    className="text-[#EF4444] hover:text-[#DC2626] p-2.5 rounded-[12px] hover:bg-[#FEF2F2] transition-colors"
                    title="Remove item"
                  >
                    <HiOutlineTrash className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>

              <div className="text-left sm:text-right sm:w-36 pt-4 sm:pt-0 border-t border-[#F1F5F9] sm:border-0 w-full sm:w-auto">
                <p className="text-[22px] font-extrabold text-[#0F172A] tracking-[-0.02em]">₹{((item.price || item.bundlePrice || 0) * item.quantity).toLocaleString()}</p>
                {item.quantity > 1 && (
                  <p className="text-[13px] text-[#94A3B8] font-medium mt-1">₹{(item.price || item.bundlePrice || 0).toLocaleString()} each</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] sticky top-24 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#5B4BFF]" />
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8 text-[15px]">
              <div className="flex justify-between">
                <span className="text-[#64748B] font-medium">Subtotal ({items.length} items)</span>
                <span className="text-[#0F172A] font-semibold">₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] font-medium">Taxes</span>
                <span className="text-[#0F172A] font-semibold">Calculated at checkout</span>
              </div>
            </div>
            
            <div className="pt-6 border-t border-[#F1F5F9] mb-8">
              <div className="flex justify-between items-baseline">
                <span className="text-[17px] font-bold text-[#0F172A]">Estimated Total</span>
                <span className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em]">₹{total.toLocaleString()}</span>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="w-full flex items-center justify-center gap-2 py-4 text-[17px] shadow-[0_4px_14px_rgba(91,75,255,0.4)]"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <HiArrowRight className="w-[18px] h-[18px]" />
            </Button>
            
            <div className="mt-6 text-center">
              <Link to="/products" className="text-[14px] text-[#5B4BFF] hover:text-[#4F3FE8] font-semibold transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
