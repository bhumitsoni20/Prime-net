import { Link } from 'react-router-dom';
import { HiOutlineHeart, HiOutlineShoppingCart } from 'react-icons/hi';
import useWishlistStore from '../../store/wishlistStore';
import useCartStore from '../../store/cartStore';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleAddToCart = (product) => {
    addItem(product);
    removeItem(product._id);
    toast.success('Moved to cart!');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 animate-scaleIn">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#5B4BFF]/10 rounded-full blur-[20px] animate-pulse" />
          <div className="relative h-28 w-28 bg-white border border-[#E2E8F0] rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.06)]">
            <HiOutlineHeart className="w-12 h-12 text-[#94A3B8]" />
          </div>
        </div>
        <h2 className="text-[28px] font-extrabold text-[#0F172A] mb-2 tracking-[-0.02em]">Your wishlist is empty</h2>
        <p className="text-[#64748B] text-[15px] mb-8 max-w-sm text-center leading-relaxed">Save premium digital subscriptions you love here and buy them later.</p>
        <Link to="/products">
          <Button size="lg" className="px-8 shadow-[0_4px_14px_rgba(91,75,255,0.3)]">Explore Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-[32px] font-extrabold text-[#0F172A] mb-8 tracking-[-0.02em]">My Wishlist</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => (
          <div key={product._id} className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 group flex flex-col h-full hover:border-[#CBD5E1]">
            <div className="relative aspect-video bg-[#F8FAFC] overflow-hidden border-b border-[#F1F5F9]">
              {product.logo ? (
                <img src={product.logo} alt={product.title} className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#5B4BFF]/5 to-[#7C3AED]/5 text-[#5B4BFF] text-5xl font-extrabold">
                  {product.title?.charAt(0)}
                </div>
              )}
              
              <button 
                onClick={() => removeItem(product._id)}
                className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-pink-500 hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors shadow-sm"
                title="Remove from wishlist"
              >
                <HiOutlineHeart className="w-[18px] h-[18px] fill-current" />
              </button>
            </div>

            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-start justify-between gap-3 mb-2">
                <Link to={`/products/${product._id}`}>
                  <h3 className="font-bold text-[#0F172A] text-[17px] hover:text-[#5B4BFF] transition-colors line-clamp-1">{product.title}</h3>
                </Link>
                <span className="font-extrabold text-[#0F172A] shrink-0 text-[17px]">₹{product.price.toLocaleString()}</span>
              </div>
              
              <p className="text-[13px] text-[#64748B] line-clamp-2 mb-6">{product.description}</p>
              
              <div className="mt-auto pt-5 flex gap-2 border-t border-[#F1F5F9]">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2 py-2"
                  onClick={() => handleAddToCart(product)}
                >
                  <HiOutlineShoppingCart className="w-[18px] h-[18px]" /> Move to Cart
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
