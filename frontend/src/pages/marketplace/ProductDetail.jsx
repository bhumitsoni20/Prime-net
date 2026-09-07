import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  HiShieldCheck, 
  HiCheckCircle, 
  HiHeart, 
  HiOutlineHeart, 
  HiStar, 
  HiLightningBolt, 
  HiArrowLeft, 
  HiClock, 
  HiSparkles,
  HiShoppingCart,
  HiCollection,
  HiDesktopComputer,
  HiLockClosed
} from 'react-icons/hi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
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
import { SpotlightCard } from '../../components/reactbits';

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40 min-h-[60vh]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto text-center py-32 px-4">
        <div className="w-16 h-16 bg-[#EEF2FF] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#5B4BFF]">
          <span className="text-3xl">🔍</span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-2">Product Not Found</h2>
        <p className="text-[#64748B] mb-6">The digital subscription you are looking for does not exist or has been removed.</p>
        <Link to="/products">
          <Button size="lg">Browse Marketplace</Button>
        </Link>
      </div>
    );
  }

  const isSoldOut = product.status === 'sold';
  const isVerifiedSeller = (product.seller?.totalSales || 0) >= 5 || product.seller?.role === 'seller';

  return (
    <div className="min-h-screen bg-[#FAFBFF] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Breadcrumb & Back Navigation */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="text-[13px] font-medium text-slate-400 flex items-center gap-2 flex-wrap">
            <Link to="/products" className="hover:text-[#5B4BFF] transition-colors flex items-center gap-1">
              <HiArrowLeft className="w-4 h-4" />
              <span>Marketplace</span>
            </Link>
            <span className="text-slate-300">/</span>
            <Link 
              to={`/products?category=${product.category}`} 
              className="hover:text-[#5B4BFF] transition-colors capitalize text-slate-600 font-semibold"
            >
              {product.category?.replace('-', ' ')}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-[#0F172A] font-bold">{product.title}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 text-emerald-700 px-3 py-1 rounded-full text-xs font-extrabold shadow-xs">
            <HiLightningBolt className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instant 1-Click Delivery</span>
          </div>
        </div>

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-14 items-start">
          
          {/* Left Column: Visual Presentation & Key Specs */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Primary Media Card */}
            <div className="relative bg-white rounded-[28px] border border-slate-200/90 p-8 shadow-[0_12px_36px_-6px_rgba(91,75,255,0.08)] overflow-hidden">
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#5B4BFF]/10 via-[#A855F7]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative h-64 sm:h-72 bg-gradient-to-b from-slate-50 to-slate-100/70 rounded-[20px] border border-slate-100 flex items-center justify-center p-8 overflow-hidden">
                {product.logo ? (
                  <img 
                    src={product.logo} 
                    alt={product.title} 
                    className="max-h-full max-w-full object-contain drop-shadow-md rounded-[18px] transition-transform duration-500 hover:scale-105" 
                  />
                ) : (
                  <div className="h-28 w-28 rounded-[24px] bg-gradient-to-br from-[#5B4BFF] to-[#7C3AED] flex items-center justify-center text-5xl font-black text-white shadow-xl shadow-[#5B4BFF]/30">
                    {product.title?.[0]}
                  </div>
                )}

                {/* Floating Category Pill */}
                <div className="absolute top-3.5 left-3.5 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-extrabold text-[#5B4BFF] border border-[#5B4BFF]/20 shadow-xs uppercase tracking-wider">
                  {product.category?.replace('-', ' ')}
                </div>

                {/* Floating Wishlist Heart */}
                <button
                  onClick={() => toggleItem(product)}
                  aria-label="Save to Wishlist"
                  className={`absolute top-3.5 right-3.5 h-9 w-9 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-slate-200/80 flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                    liked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'
                  }`}
                >
                  {liked ? <HiHeart className="w-5 h-5" /> : <HiOutlineHeart className="w-5 h-5" />}
                </button>
              </div>

              {/* Product Title & Short Description */}
              <div className="mt-6">
                <h1 className="text-[24px] sm:text-[28px] font-extrabold text-[#0F172A] leading-tight tracking-[-0.03em] mb-2">
                  {product.title}
                </h1>
                {product.description && (
                  <p className="text-slate-600 text-[14px] sm:text-[15px] leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>
            </div>

            {/* Buyer Protection / Trust Badges */}
            <div className="bg-white rounded-[24px] border border-slate-200/90 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <HiShieldCheck className="w-5 h-5 text-[#5B4BFF]" />
                StreamKart Buyer Guarantee
              </h3>

              <div className="space-y-3.5 text-[13px]">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">100% Replacement Warranty:</span>
                    <span className="text-slate-600 ml-1">Guaranteed working pass or instant replacement.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-[#5B4BFF] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">Escrow Security:</span>
                    <span className="text-slate-600 ml-1">Funds are protected until you verify access.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">Automated Wallet Delivery:</span>
                    <span className="text-slate-600 ml-1">Receive login credentials directly in your dashboard.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Checkout Panel & Details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Main Pricing & Action Hub */}
            <div className="bg-white rounded-[28px] border border-slate-200/90 p-6 sm:p-9 shadow-[0_20px_50px_rgba(91,75,255,0.08)] relative overflow-hidden">
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5B4BFF] via-[#A855F7] to-[#3B82F6]" />

              {/* Status Header & Rating */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="inline-flex items-center gap-2 bg-[#F3F1FF] text-[#5B4BFF] px-3.5 py-1.5 rounded-full text-xs font-extrabold border border-[#5B4BFF]/20">
                  <HiSparkles className="w-3.5 h-3.5 text-[#A855F7]" />
                  <span>Verified Digital Pass</span>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/80">
                  <span className="text-amber-400 text-sm">★</span>
                  <span className="text-[13px] font-extrabold text-slate-800">{(product.ratings || 0).toFixed(1)}</span>
                  <span className="text-[12px] font-semibold text-slate-400">({product.totalReviews || 0} reviews)</span>
                </div>
              </div>

              {/* Big Price Display */}
              <div className="flex flex-wrap items-baseline gap-2 mb-6 pb-6 border-b border-slate-100">
                <span className="text-[44px] sm:text-[54px] font-black text-[#0F172A] tracking-tight leading-none">
                  ₹{product.price}
                </span>
                <span className="text-slate-400 font-bold text-base sm:text-lg">
                  / {product.duration ? product.duration.replace(/^1 /i, '') : 'month'}
                </span>
                <span className="ml-auto bg-emerald-50 text-emerald-700 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200">
                  Best Value
                </span>
              </div>

              {/* Plan Specifications Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {product.planName && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-[14px] p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">Plan Tier</span>
                    <span className="text-[13px] font-extrabold text-slate-800">{product.planName}</span>
                  </div>
                )}

                {product.deviceLoginCount && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-[14px] p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">Screens</span>
                    <span className="text-[13px] font-extrabold text-slate-800">{product.deviceLoginCount} Device{product.deviceLoginCount > 1 ? 's' : ''}</span>
                  </div>
                )}

                {product.deviceLoginType && (
                  <div className="bg-indigo-50/60 border border-indigo-100 rounded-[14px] p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block mb-0.5">Device Type</span>
                    <span className="text-[13px] font-extrabold text-[#5B4BFF]">{product.deviceLoginType}</span>
                  </div>
                )}
              </div>

              {/* Features List */}
              {product.features && product.features.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-3">
                    Included Features & Perks
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {product.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2.5 bg-[#F8FAFC] border border-slate-100 rounded-xl px-3.5 py-2.5">
                        <HiCheckCircle className="w-4 h-4 text-[#5B4BFF] flex-shrink-0" />
                        <span className="text-[13px] font-bold text-slate-700 capitalize">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary Call to Action Buttons */}
              {isSoldOut ? (
                <div className="mb-6">
                  <Button disabled size="lg" className="w-full py-4 text-base bg-slate-200 text-slate-500 cursor-not-allowed border-none shadow-none">
                    SOLD OUT
                  </Button>
                  <p className="text-center text-xs text-rose-500 font-bold mt-2 uppercase tracking-wider">
                    This inventory has been claimed
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3.5 mb-6">
                  <Button 
                    size="lg" 
                    className="flex-1 py-4 text-base font-extrabold rounded-[16px] bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED] hover:from-[#4F3FE8] hover:to-[#6D28D9] shadow-[0_6px_20px_rgba(91,75,255,0.35)] flex items-center justify-center gap-2"
                    onClick={() => { addToCart(product); navigate('/checkout'); }}
                  >
                    <HiSparkles className="w-5 h-5" />
                    <span>Buy Now</span>
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="flex-1 py-4 text-base font-bold rounded-[16px] border-slate-200 hover:bg-slate-50 text-slate-800 flex items-center justify-center gap-2"
                    onClick={() => {
                      addToCart(product);
                      toast.success('Added to your cart!');
                    }}
                  >
                    <HiShoppingCart className="w-5 h-5 text-slate-600" />
                    <span>Add to Cart</span>
                  </Button>
                </div>
              )}

              {/* Security & Instant Delivery Footer Tag */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500 pt-4 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <HiLockClosed className="w-4 h-4 text-[#5B4BFF]" />
                  Secure 256-Bit Checkout
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  <HiClock className="w-4 h-4 text-emerald-600" />
                  Instant Activation
                </span>
              </div>
            </div>

            {/* Seller Reputation Card */}
            <div className="bg-white rounded-[24px] border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <Avatar name={product.seller?.name || 'Seller'} size="lg" className="ring-4 ring-indigo-50" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[#0F172A] font-extrabold text-[16px]">{product.seller?.name || 'Seller'}</p>
                    {isVerifiedSeller && (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
                        <HiCheckCircle className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">Trusted Digital Asset Merchant</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-[#F8FAFC] py-2.5 px-5 rounded-[16px] border border-slate-200/80">
                <div className="text-center">
                  <p className="text-[#0F172A] font-black text-lg leading-none">{product.seller?.totalSales || 0}</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Sales</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <p className="text-[#0F172A] font-black text-lg leading-none">{(product.seller?.ratings || 0).toFixed(1)}</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Rating</p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white border border-slate-200/90 rounded-[28px] p-6 sm:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-8 border-b border-slate-100 gap-6">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-extrabold text-[#5B4BFF] uppercase tracking-wider mb-1">
                <HiSparkles className="w-3.5 h-3.5" />
                <span>Verified Feedback</span>
              </div>
              <h2 className="text-[24px] sm:text-[28px] font-extrabold text-[#0F172A] tracking-tight">
                Customer Reviews
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Real feedback from verified purchasers of {product.title}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[#F8FAFC] px-6 py-4 rounded-[20px] border border-slate-200/80 self-start sm:self-auto">
              <div>
                <span className="text-[32px] font-black text-[#0F172A] leading-none block">
                  {(product.ratings || 0).toFixed(1)}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Out of 5 Stars
                </span>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div>
                <Rating value={product.ratings || 0} size="md" />
                <span className="text-[12px] font-semibold text-slate-500 block mt-1">
                  Based on {product.totalReviews || 0} review{product.totalReviews === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </div>

          {/* Write a Review Box for Eligible Buyers */}
          {canReview && (
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-[20px] p-6 sm:p-8 mb-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#5B4BFF] to-[#7C3AED]" />
              <h3 className="text-lg font-bold text-[#0F172A] mb-4">Write a Verified Buyer Review</h3>
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <HiStar
                        key={star}
                        className={`w-8 h-8 cursor-pointer transition-colors ${
                          reviewForm.rating >= star ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'
                        }`}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Your Experience</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 rounded-[14px] bg-white border border-slate-200 focus:ring-[3px] focus:ring-[#5B4BFF]/15 focus:border-[#5B4BFF] outline-none transition-all text-slate-900 placeholder-slate-400 text-sm"
                    placeholder="Share how quickly your activation was completed and your experience with the seller..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  />
                </div>

                <div className="text-right">
                  <Button type="submit" disabled={isSubmittingReview} size="md" className="rounded-xl shadow-xs">
                    {isSubmittingReview ? 'Submitting...' : 'Submit Verified Review'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews Grid */}
          {reviews.length === 0 ? (
            <div className="text-center py-16 bg-[#F8FAFC] rounded-[20px] border border-dashed border-slate-200">
              <span className="text-3xl block mb-2">💬</span>
              <p className="text-slate-600 font-bold text-[15px]">No reviews yet</p>
              <p className="text-slate-400 text-xs mt-1">Be the first verified buyer to review this subscription!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((r) => (
                <ReviewCard key={r._id} review={r} />
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center text-slate-400 text-xs">
          Disclaimer: Brand names and logos are displayed solely for identification and informational purposes. StreamKart provides marketplace intermediary services.
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
