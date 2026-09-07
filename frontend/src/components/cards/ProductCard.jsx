import { Link } from 'react-router-dom';
import { HiHeart, HiOutlineHeart, HiShoppingCart, HiLightningBolt } from 'react-icons/hi';
import Badge from '../ui/Badge';
import useCart from '../../hooks/useCart';
import useWishlistStore from '../../store/wishlistStore';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const liked = isInWishlist(product._id);

  const isVerifiedSeller = (product.seller?.totalSales || 0) >= 5 || product.seller?.role === 'seller';

  return (
    <div className="group bg-white border border-slate-200/90 rounded-[24px] overflow-hidden transition-all duration-300 hover:shadow-[0_16px_36px_-8px_rgba(91,75,255,0.12)] hover:border-[#5B4BFF]/40 hover:-translate-y-1 flex flex-col p-4 relative">
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative h-44 bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9]/60 rounded-[18px] flex items-center justify-center overflow-hidden mb-4 border border-slate-100">
          {product.logo ? (
            <img
              src={product.logo}
              alt={product.title}
              loading="lazy"
              decoding="async"
              className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-500 ease-out drop-shadow-sm rounded-[16px]"
            />
          ) : (
            <div className="h-20 w-20 rounded-[18px] bg-white border border-slate-200 shadow-sm flex items-center justify-center text-3xl font-extrabold text-[#5B4BFF]">
              {product.title?.[0]}
            </div>
          )}

          {/* Instant Delivery Chip */}
          <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-600 border border-amber-200/60 shadow-xs flex items-center gap-1">
            <HiLightningBolt className="w-3 h-3 text-amber-500" />
            <span>Instant</span>
          </div>
        </div>
      </Link>

      {/* Badges and Actions */}
      {isVerifiedSeller && (
        <div className="absolute top-6 right-6">
          <div className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide flex items-center gap-1 border border-emerald-200/80 shadow-xs">
            <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            Verified
          </div>
        </div>
      )}

      <button
        onClick={(e) => {
          e.preventDefault();
          toggleItem(product);
        }}
        aria-label="Save to Wishlist"
        className={`absolute top-6 left-6 h-8 w-8 rounded-full bg-white/90 backdrop-blur-md shadow-xs border border-slate-200/60 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
          liked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'
        }`}
      >
        {liked ? <HiHeart className="w-4.5 h-4.5" /> : <HiOutlineHeart className="w-4.5 h-4.5" />}
      </button>

      <div className="px-1 flex-1 flex flex-col">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-[#0F172A] font-extrabold text-[15px] sm:text-[16px] mb-1 group-hover:text-[#5B4BFF] transition-colors duration-200 line-clamp-1">
            {product.title}
          </h3>
        </Link>

        {(product.planName || product.deviceLoginType || product.deviceLoginCount) && (
          <div className="flex flex-wrap gap-1.5 mb-3 mt-1.5">
            {product.planName && (
              <Badge variant="gray" className="text-[10px] py-0.5 px-2 bg-slate-100/90 text-slate-700 border-slate-200 font-semibold rounded-md">
                {product.planName}
              </Badge>
            )}
            {product.deviceLoginCount && (
              <Badge variant="gray" className="text-[10px] py-0.5 px-2 bg-slate-100/90 text-slate-700 border-slate-200 font-semibold rounded-md">
                {product.deviceLoginCount} Device{product.deviceLoginCount > 1 ? 's' : ''}
              </Badge>
            )}
            {product.deviceLoginType && (
              <Badge variant="gray" className="text-[10px] py-0.5 px-2 bg-indigo-50/80 text-indigo-700 border-indigo-100 font-semibold rounded-md">
                {product.deviceLoginType}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-amber-400 text-[14px]">★</span>
          <span className="text-[13px] font-extrabold text-slate-800">{(product.ratings || 0).toFixed(1)}</span>
          <span className="text-[12px] font-semibold text-slate-400">({product.totalReviews || 0})</span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
          <div className="flex items-baseline gap-1">
            <span className="text-[19px] font-black text-[#0F172A] tracking-tight">₹{product.price}</span>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              /{product.duration ? product.duration.replace(/^1 /i, '') : 'mo'}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            aria-label="Add to cart"
            className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#5B4BFF] to-[#7C3AED] hover:from-[#4F3FE8] hover:to-[#6D28D9] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(91,75,255,0.3)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <HiShoppingCart className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-3 text-[9px] leading-tight text-slate-400 text-center">
          Verified digital pass & instant wallet delivery
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
