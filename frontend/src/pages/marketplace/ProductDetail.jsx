import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProduct } from '../../hooks/useProducts';
import useCart from '../../hooks/useCart';
import useWishlistStore from '../../store/wishlistStore';
import useAuthStore from '../../store/authStore';
import { apiGet, apiPost } from '../../services/api';
import Rating from '../../components/ui/Rating';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ReviewCard from '../../components/cards/ReviewCard';
import Avatar from '../../components/ui/Avatar';
import { HiShieldCheck, HiCheckCircle, HiHeart, HiOutlineHeart, HiStar } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useProduct(id);
  const { addToCart } = useCart();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const product = data?.data;
  const liked = product ? isInWishlist(product._id) : false;

  useEffect(() => {
    if (product?._id) {
      fetchReviews();
      if (isAuthenticated) {
        checkReviewEligibility();
      }
    }
  }, [product?._id, isAuthenticated]);

  const fetchReviews = async () => {
    try {
      const res = await apiGet(`/reviews/product/${product._id}?limit=20`);
      setReviews(res.data || []);
    } catch (error) {
      console.error('Failed to load reviews', error);
    }
  };

  const checkReviewEligibility = async () => {
    try {
      const res = await apiGet(`/reviews/eligibility/${product._id}`);
      setCanReview(res.data?.canReview || false);
    } catch (error) {
      console.error('Failed to check eligibility', error);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating) return;
    
    setIsSubmittingReview(true);
    try {
      const res = await apiPost('/reviews', {
        productId: product._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      toast.success('Review submitted successfully!');
      
      const newReview = { ...res.data, user: { name: user.name, avatar: user.avatar } };
      setReviews([newReview, ...reviews]);
      setCanReview(false);
      setReviewForm({ rating: 5, comment: '' });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="xl" /></div>;
  if (!product) return <div className="text-center py-32 text-[#94A3B8] font-medium text-lg">Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="text-[13px] font-medium text-[#94A3B8] mb-8 flex items-center gap-2.5">
        <Link to="/products" className="hover:text-[#0F172A] transition-colors">Marketplace</Link>
        <span className="text-[#CBD5E1]">/</span>
        <span className="text-[#64748B] capitalize">{product.category?.replace('-', ' ')}</span>
        <span className="text-[#CBD5E1]">/</span>
        <span className="text-[#0F172A] font-semibold">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Logo Box */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-[24px] overflow-hidden h-72 flex items-center justify-center p-8 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
            {product.logo ? (
              <img src={product.logo} alt={product.title} className="max-h-full max-w-full object-contain drop-shadow-sm rounded-[16px] hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="h-28 w-28 rounded-[20px] bg-gradient-to-br from-[#5B4BFF]/10 to-[#7C3AED]/10 flex items-center justify-center text-5xl font-bold text-[#5B4BFF]">{product.title?.[0]}</div>
            )}
          </div>
          
          {/* Name & Description */}
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow">
            <h1 className="text-[26px] font-bold text-[#0F172A] mb-3 tracking-[-0.02em]">{product.title}</h1>
            <p className="text-[#64748B] leading-relaxed text-[15px]">{product.description}</p>
          </div>

          {/* Features */}
          {product.features?.length > 0 && (
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h3 className="font-bold text-[#0F172A] mb-5 text-[17px]">Key Features</h3>
              <div className="space-y-4">
                {product.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <div className="h-6 w-6 rounded-full bg-[#5B4BFF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <HiShieldCheck className="w-3.5 h-3.5 text-[#5B4BFF]" />
                    </div>
                    <p className="text-[#475569] text-[15px] leading-relaxed">{f}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 md:p-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] h-full flex flex-col relative overflow-hidden">
            {/* Top decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED]" />

            <div className="flex items-center justify-between mb-6">
              <Badge variant="primary" className="px-3 py-1 bg-[#5B4BFF]/10 text-[#5B4BFF] border-[#5B4BFF]/20">BEST SELLER</Badge>
            </div>
            
            <div className="flex items-end gap-1.5 mb-6 flex-1">
              <span className="text-5xl md:text-[64px] font-extrabold text-[#0F172A] tracking-[-0.04em] leading-none">₹{product.price}</span>
              <span className="text-[#94A3B8] font-semibold text-lg mb-2 capitalize">/ {product.duration || '1 month'}</span>
            </div>

            {/* Plan Info Badges */}
            <div className="flex flex-wrap gap-2 mb-10">
              {product.planName && <Badge variant="gray" className="text-[13px] py-1.5 px-3 bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] font-semibold">{product.planName}</Badge>}
              {product.deviceLoginCount && <Badge variant="gray" className="text-[13px] py-1.5 px-3 bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] font-semibold">{product.deviceLoginCount} Device{product.deviceLoginCount > 1 ? 's' : ''}</Badge>}
              {product.deviceLoginType && <Badge variant="gray" className="text-[13px] py-1.5 px-3 bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] font-semibold">{product.deviceLoginType}</Badge>}
            </div>

            {/* Key Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-12 flex-1">
                <h3 className="text-[17px] font-bold text-[#0F172A] mb-5">Key Features</h3>
                <div className="flex flex-col gap-4">
                  {product.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-4 text-[#475569]">
                      <div className="h-8 w-8 rounded-full bg-[#5B4BFF]/10 flex items-center justify-center flex-shrink-0">
                        <HiShieldCheck className="w-[18px] h-[18px] text-[#5B4BFF]" />
                      </div>
                      <span className="text-[15px] font-medium uppercase tracking-wide">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {product.status === 'sold' ? (
              <div className="flex flex-col gap-3 mb-8">
                <Button disabled size="lg" className="flex-1 py-4 text-[17px] bg-slate-200 text-slate-500 cursor-not-allowed border-none shadow-none">
                  SOLD OUT
                </Button>
                <p className="text-center text-[13px] text-rose-500 font-bold uppercase tracking-wide">This listing is no longer available</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="flex-1 py-4 text-[17px] shadow-[0_4px_14px_rgba(91,75,255,0.4)]" onClick={() => { addToCart(product); navigate('/checkout'); }}>
                  Buy Now
                </Button>
                <Button variant="secondary" size="lg" className="flex-1 py-4 text-[17px]" onClick={() => addToCart(product)}>
                  Add to Cart
                </Button>
              </div>
            )}
            
            <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-6">
              <Button 
                variant="ghost" 
                className={`flex items-center gap-2 transition-colors ${liked ? 'text-pink-500 hover:bg-pink-50' : 'text-[#64748B] hover:text-[#0F172A]'}`}
                onClick={() => toggleItem(product)}
              >
                {liked ? <HiHeart className="w-[22px] h-[22px] text-pink-500" /> : <HiOutlineHeart className="w-[22px] h-[22px]" />}
                <span className="font-medium text-[15px]">{liked ? 'Added to Wishlist' : 'Save to Wishlist'}</span>
              </Button>
            </div>

            {/* Seller Info */}
            <div className="mt-10 bg-[#F8FAFC] rounded-[20px] p-6 flex flex-col sm:flex-row sm:items-center justify-between border border-[#E2E8F0] gap-6">
              <div className="flex items-center gap-4">
                <Avatar name={product.seller?.name || 'Seller'} size="lg" className="ring-4 ring-white" />
                <div>
                  <p className="text-[#0F172A] font-bold text-[17px]">{product.seller?.name || 'Seller'}</p>
                  {(product.seller?.totalSales || 0) >= 10 && (
                    <p className="text-[#15803D] text-[13px] flex items-center gap-1 mt-1 font-semibold">
                      <HiCheckCircle className="w-4 h-4" /> Verified Vendor
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-8 text-center bg-white py-3 px-6 rounded-[16px] border border-[#E2E8F0] shadow-sm">
                <div>
                  <p className="text-[#0F172A] font-extrabold text-[22px] leading-none mb-1">{product.seller?.totalSales || 0}</p>
                  <p className="text-[#94A3B8] text-[11px] font-bold tracking-[0.1em]">SALES</p>
                </div>
                <div className="w-px bg-[#E2E8F0]" />
                <div>
                  <p className="text-[#0F172A] font-extrabold text-[22px] leading-none mb-1">{(product.seller?.ratings || 0).toFixed(1)}</p>
                  <p className="text-[#94A3B8] text-[11px] font-bold tracking-[0.1em]">RATING</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#F1F5F9] text-[11px] leading-relaxed text-[#94A3B8] text-center px-4">
              Disclaimer: Brand names and logos are displayed solely for identification and informational purposes.
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 md:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 pb-8 border-b border-[#F1F5F9] gap-4">
          <div>
            <h2 className="text-[26px] font-bold text-[#0F172A] tracking-[-0.02em]">Customer Reviews</h2>
            <p className="text-[#64748B] mt-1.5 text-[15px]">See what others are saying about {product.title}</p>
          </div>
          <div className="text-left sm:text-right bg-[#F8FAFC] px-6 py-4 rounded-[16px] border border-[#F1F5F9]">
            <div className="flex items-center gap-3 sm:justify-end mb-1.5">
              <Rating value={product.ratings || 0} size="md" />
              <span className="text-[28px] font-extrabold text-[#0F172A] leading-none">{(product.ratings || 0).toFixed(1)}</span>
            </div>
            <span className="text-[13px] font-semibold text-[#94A3B8]">Based on {product.totalReviews || 0} reviews</span>
          </div>
        </div>
        
        {canReview && (
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[20px] p-8 mb-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#5B4BFF]" />
            <h3 className="text-xl font-bold text-[#0F172A] mb-5">Write a Review</h3>
            <form onSubmit={submitReview} className="space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-wide">Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <HiStar
                      key={star}
                      className={`w-[34px] h-[34px] cursor-pointer transition-colors ${reviewForm.rating >= star ? 'text-amber-400' : 'text-[#E2E8F0] hover:text-amber-200'}`}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-wide">Your Review</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-[14px] border border-[#CBD5E1] focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] outline-none transition-all text-[#0F172A] placeholder-[#94A3B8]"
                  placeholder="What did you like or dislike about this product?"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
              </div>
              <div className="text-right">
                <Button type="submit" disabled={isSubmittingReview} size="lg">
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-[#F8FAFC] rounded-[20px] border border-dashed border-[#CBD5E1]">
            <p className="text-[#64748B] font-medium text-[15px]">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((r) => (
              <ReviewCard key={r._id} review={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
