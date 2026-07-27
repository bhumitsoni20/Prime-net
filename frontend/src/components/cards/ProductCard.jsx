import { Link } from 'react-router-dom';
import { HiHeart, HiOutlineHeart, HiShoppingCart } from 'react-icons/hi';
import Badge from '../ui/Badge';
import useCart from '../../hooks/useCart';
import useWishlistStore from '../../store/wishlistStore';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const liked = isInWishlist(product._id);

  return (
    <div className="group bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)] hover:border-[#CBD5E1] flex flex-col p-4 relative">
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative h-44 bg-[#F8FAFC] rounded-[16px] flex items-center justify-center overflow-hidden mb-5">
          {product.logo ? (
            <img src={product.logo} alt={product.title} loading="lazy" decoding="async" className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-500 ease-out drop-shadow-sm rounded-[16px]" />
          ) : (
            <div className="h-20 w-20 rounded-[16px] bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-3xl font-extrabold text-[#5B4BFF]">
              {product.title?.[0]}
            </div>
          )}
        </div>
      </Link>

      {/* Badges and Actions */}
      <div className="absolute top-7 right-7">
        <div className="bg-[#F0FDF4] text-[#16A34A] px-2 py-1 rounded-[6px] text-[10px] font-bold tracking-wide flex items-center gap-1 border border-[#BBF7D0]">
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          Verified
        </div>
      </div>
      <button
        onClick={(e) => { e.preventDefault(); toggleItem(product); }}
        className={`absolute top-7 left-7 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 ${liked ? 'text-red-500' : 'text-[#94A3B8] hover:text-red-400'}`}
      >
        {liked ? <HiHeart className="w-5 h-5" /> : <HiOutlineHeart className="w-5 h-5" />}
      </button>

      <div className="px-1 flex-1 flex flex-col">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-[#0F172A] font-extrabold text-[16px] mb-1 group-hover:text-[#5B4BFF] transition-colors duration-200 line-clamp-1">
            {product.title}
          </h3>
        </Link>
        <p className="text-[#94A3B8] text-[12px] font-medium mb-3">Fast Delivery</p>

        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-[#F59E0B] text-[14px]">★</span>
          <span className="text-[13px] font-bold text-[#334155]">{(product.ratings || 5.0).toFixed(1)}</span>
          <span className="text-[12px] font-medium text-[#94A3B8]">({product.totalReviews || Math.floor(Math.random() * 500) + 100})</span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-baseline gap-1">
            <span className="text-[18px] font-extrabold text-[#0F172A]">₹{product.price}</span>
            <span className="text-[12px] text-[#94A3B8] font-bold uppercase tracking-wider">/mo</span>
          </div>
          
          <button 
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
            className="w-10 h-10 rounded-[12px] bg-[#5B4BFF] hover:bg-[#4F3FE8] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(91,75,255,0.3)] transition-all hover:scale-105 active:scale-95"
          >
            <HiShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
