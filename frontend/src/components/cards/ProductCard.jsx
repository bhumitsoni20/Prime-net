import { Link } from 'react-router-dom';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import Badge from '../ui/Badge';
import Rating from '../ui/Rating';
import Button from '../ui/Button';
import useCart from '../../hooks/useCart';
import useWishlistStore from '../../store/wishlistStore';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const liked = isInWishlist(product._id);

  return (
    <div className="group bg-white border border-[#E2E8F0] rounded-[18px] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)] hover:border-[#CBD5E1]">
      <Link to={`/products/${product._id}`}>
        <div className="relative h-48 bg-[#F8FAFC] flex items-center justify-center overflow-hidden border-b border-[#F1F5F9] p-5">
          {product.logo ? (
            <img src={product.logo} alt={product.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out drop-shadow-sm rounded-lg" />
          ) : (
            <div className="h-20 w-20 rounded-[16px] bg-gradient-to-br from-[#5B4BFF]/10 to-[#7C3AED]/10 flex items-center justify-center text-3xl font-bold text-[#5B4BFF]">
              {product.title?.[0]}
            </div>
          )}
          {/* Verified badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="verified" className="text-[10px]">✓ Verified</Badge>
          </div>
          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); toggleItem(product); }}
            className={`absolute top-3 left-3 h-8 w-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${liked ? 'bg-red-50 text-red-500 scale-110' : 'bg-white/90 text-[#94A3B8] hover:bg-white hover:text-red-400 hover:scale-105'}`}
          >
            {liked ? <HiHeart className="w-4 h-4" /> : <HiOutlineHeart className="w-4 h-4" />}
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-[#0F172A] font-semibold text-[15px] mb-0.5 group-hover:text-[#5B4BFF] transition-colors duration-200 line-clamp-1">
            {product.title}
          </h3>
        </Link>
        <p className="text-[#94A3B8] text-sm mb-3 line-clamp-1">{product.description}</p>

        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-[#0F172A]">₹{product.price}</span>
            <span className="text-xs text-[#94A3B8] font-medium">/mo</span>
          </div>
          {product.totalSales > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-amber-400 text-sm">★</span>
              <span className="text-[13px] font-semibold text-[#475569]">{(product.ratings || 0).toFixed(1)}</span>
            </div>
          )}
        </div>

        <Button size="sm" className="w-full" onClick={() => addToCart(product)}>
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
