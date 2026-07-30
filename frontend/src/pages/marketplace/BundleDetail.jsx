import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HiCheckCircle, HiStar, HiClock, HiShieldCheck } from 'react-icons/hi';
import api, { apiGet, apiPost } from '../../services/api';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import useCart from '../../hooks/useCart';
import useAuthStore from '../../store/authStore';
import Rating from '../../components/ui/Rating';
import ReviewCard from '../../components/cards/ReviewCard';
import toast from 'react-hot-toast';

const BundleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuthStore();
  
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { data: bundle, isLoading } = useQuery({
    queryKey: ['bundle', id],
    queryFn: async () => {
      const res = await api.get(`/bundles/${id}`);
      return res.data;
    }
  });

  useEffect(() => {
    if (bundle) {
      apiGet(`/reviews/bundle/${id}`).then(res => {
        if (res.success) setReviews(res.data || []);
      }).catch(err => console.error(err));

      if (isAuthenticated) {
        apiGet(`/reviews/eligibility/${id}`).then(res => {
          if (res.success) setCanReview(res.data.canReview);
        }).catch(err => console.error(err));
      }
    }
  }, [bundle, id, isAuthenticated]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!bundle) {
    return <div className="min-h-screen flex items-center justify-center">Bundle not found</div>;
  }

  const discountAmount = bundle.originalPrice - bundle.bundlePrice;
  const discountPercent = Math.round((discountAmount / bundle.originalPrice) * 100);

  const handleCheckout = () => {
    addToCart(bundle);
    navigate('/checkout', { state: { bundleId: bundle._id } });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating) return toast.error('Rating is required');
    
    setIsSubmittingReview(true);
    try {
      const res = await apiPost('/reviews', {
        bundleId: id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      if (res.success) {
        toast.success('Review submitted');
        setCanReview(false);
        setReviews([res.data, ...reviews]);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      {/* Banner */}
      <div className="w-full h-[300px] md:h-[400px] relative overflow-hidden bg-[#0F172A]">
        {bundle.bannerImage ? (
          <img src={bundle.bannerImage} alt="Banner" className="w-full h-full object-cover opacity-50" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#5B4BFF]/40 to-[#0F172A]"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 pb-16 flex flex-col items-start max-w-7xl mx-auto">
          <div className="flex gap-2 mb-4">
            <span className="bg-[#10B981] text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">SAVE {discountPercent}%</span>
            <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">{bundle.category.replace('-', ' ')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight max-w-3xl leading-tight">
            {bundle.title}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Included Products */}
          <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E2E8F0]">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-6">What's Included</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bundle.products.map((p, idx) => (
                <div key={idx} className="flex items-start gap-4 p-5 bg-[#F8FAFC] rounded-[16px] border border-[#E2E8F0] hover:border-[#5B4BFF]/30 transition-colors">
                  <div className="w-14 h-14 rounded-[12px] bg-white border border-[#E2E8F0] flex items-center justify-center overflow-hidden shrink-0">
                    {p.product.logo ? (
                      <img src={p.product.logo} alt={p.product.title} className="w-10 h-10 object-contain" />
                    ) : (
                      <div className="text-xl font-bold text-[#5B4BFF]">{p.product.title[0]}</div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0F172A] mb-1">{p.product.title}</h3>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-[#64748B]">
                      <span className="flex items-center gap-1"><HiClock /> {p.duration}</span>
                      <span className="flex items-center gap-1"><HiShieldCheck /> {p.warranty} Warranty</span>
                      <span>• {p.accountType}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E2E8F0]">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Description</h2>
            <p className="text-[#334155] leading-relaxed whitespace-pre-wrap">{bundle.description}</p>
          </div>
        </div>

        {/* Right Content - Sticky Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-[24px] p-8 shadow-[0_8px_30px_-4px_rgba(15,23,42,0.1)] border border-[#E2E8F0] sticky top-24">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[#64748B] text-sm font-medium line-through mb-1">Original: ₹{bundle.originalPrice}</p>
                <div className="flex items-end gap-2">
                  <h2 className="text-4xl font-black text-[#5B4BFF]">₹{bundle.bundlePrice}</h2>
                  <span className="text-[#94A3B8] font-semibold text-lg mb-1 capitalize">/ {bundle.duration || '1 month'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-[#334155] font-medium bg-green-50 p-3 rounded-[12px] text-green-700">
                <HiCheckCircle size={20} className="shrink-0" />
                <span>You save ₹{discountAmount} compared to buying separately</span>
              </div>
              <div className="flex items-center gap-3 text-[#334155] font-medium">
                <HiCheckCircle size={20} className="text-[#10B981] shrink-0" />
                <span>Instant Credential Delivery in Chat</span>
              </div>
              <div className="flex items-center gap-3 text-[#334155] font-medium">
                <HiCheckCircle size={20} className="text-[#10B981] shrink-0" />
                <span>One simple payment for {bundle.products.length} subscriptions</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                size="lg"
                className="flex-1 py-4 text-lg font-bold shadow-[0_4px_14px_rgba(91,75,255,0.4)] hover:shadow-[0_6px_20px_rgba(91,75,255,0.6)] hover:-translate-y-0.5 transition-all"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={handleCheckout}
              >
                Buy Now
              </Button>
              <Button variant="secondary" size="lg" className="flex-1 py-4 text-lg font-bold" onClick={() => addToCart(bundle)}>
                Add to Cart
              </Button>
            </div>

            <div className="mt-8 pt-8 border-t border-[#F1F5F9]">
              <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-wider mb-4">Offered By</p>
              <div className="flex items-center gap-4 cursor-pointer hover:bg-[#F8FAFC] p-2 -mx-2 rounded-[12px] transition-colors">
                <Avatar src={bundle.seller.avatar} name={bundle.seller.name} />
                <div>
                  <h4 className="font-bold text-[#0F172A]">{bundle.seller.name}</h4>
                  <div className="flex items-center gap-1 text-[13px] text-[#F59E0B] font-bold">
                    <HiStar /> {bundle.seller.ratings?.toFixed(1) || 'New'}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 md:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 pb-8 border-b border-[#F1F5F9] gap-4">
            <div>
              <h2 className="text-[26px] font-bold text-[#0F172A] tracking-[-0.02em]">Customer Reviews</h2>
              <p className="text-[#64748B] mt-1.5 text-[15px]">See what others are saying about {bundle.title}</p>
            </div>
            <div className="text-left sm:text-right bg-[#F8FAFC] px-6 py-4 rounded-[16px] border border-[#F1F5F9]">
              <div className="flex items-center gap-3 sm:justify-end mb-1.5">
                <Rating value={bundle.ratings || 0} size="md" />
                <span className="text-[28px] font-extrabold text-[#0F172A] leading-none">{(bundle.ratings || 0).toFixed(1)}</span>
              </div>
              <span className="text-[13px] font-semibold text-[#94A3B8]">Based on {bundle.totalReviews || 0} reviews</span>
            </div>
          </div>
          
          {canReview && (
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[20px] p-8 mb-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#5B4BFF]" />
              <h3 className="text-xl font-bold text-[#0F172A] mb-5">Write a Review</h3>
              <form onSubmit={submitReview} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-wide">Rating</label>
                  <div className="bg-white px-4 py-3 rounded-[12px] border border-[#E2E8F0] inline-block">
                    <Rating 
                      value={reviewForm.rating} 
                      onChange={(val) => setReviewForm(prev => ({ ...prev, rating: val }))} 
                      readonly={false}
                      size="lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-wide">Review (Optional)</label>
                  <textarea
                    rows={4}
                    className="w-full bg-white border border-[#E2E8F0] rounded-[16px] p-4 text-[15px] focus:ring-2 focus:ring-[#5B4BFF]/20 focus:border-[#5B4BFF] transition-all outline-none resize-none"
                    placeholder="Share your experience with this bundle..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmittingReview}
                  className="px-8"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </form>
            </div>
          )}

          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map(review => (
                <ReviewCard key={review._id} review={review} />
              ))
            ) : (
              <div className="text-center py-12 px-4 rounded-[20px] bg-[#F8FAFC] border border-[#F1F5F9]">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-[#E2E8F0]">
                  <HiStar className="w-8 h-8 text-[#CBD5E1]" />
                </div>
                <p className="text-[#64748B] text-lg font-medium">No reviews yet for this bundle.</p>
                <p className="text-[#94A3B8] text-sm mt-1">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleDetail;
