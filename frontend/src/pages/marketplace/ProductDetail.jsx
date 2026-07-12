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
      
      // Add the new review locally
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

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!product) return <div className="text-center py-32 text-gray-500">Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link to="/products" className="hover:text-indigo-600">Marketplace</Link>
        <span>›</span>
        <span className="text-gray-400">{product.category?.replace('-', ' ')}</span>
        <span>›</span>
        <span className="text-gray-900 font-medium">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left Column — Logo and Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Logo Box */}
          <div className="bg-gray-50 border border-gray-100 rounded-3xl overflow-hidden h-64 flex items-center justify-center p-6 shadow-sm">
            {product.logo ? (
              <img src={product.logo} alt={product.title} className="max-h-full max-w-full object-contain drop-shadow-sm rounded-xl" />
            ) : (
              <div className="h-24 w-24 rounded-3xl bg-gray-200 flex items-center justify-center text-5xl font-bold text-gray-400">{product.title?.[0]}</div>
            )}
          </div>
          
          {/* Name & Description Box */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.title}</h1>
            <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>
          </div>

          {/* Feature cards */}
          {product.features?.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
              <div className="space-y-4">
                {product.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <HiShieldCheck className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <p className="text-gray-700 text-sm">{f}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column — Pricing Details */}
        <div className="lg:col-span-2">
          {/* Pricing Box */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="verified">BEST SELLER</Badge>
              <span className="text-indigo-600 text-sm font-medium">Save 20%</span>
            </div>
            
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-bold text-gray-900">₹{product.price}</span>
            </div>

            {/* High level benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 flex-1">
              {['Unlimited Data Retention', '24/7 Priority Support', 'Custom SSO Integration', '99.9% Uptime Guarantee'].map((f) => (
                <div key={f} className="flex items-center gap-3 text-gray-700">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <HiCheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="text-sm font-medium">{f}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" className="flex-1 py-4 text-lg" onClick={() => { addToCart(product); navigate('/checkout'); }}>Buy Now</Button>
              <Button variant="secondary" size="lg" className="flex-1 py-4 text-lg" onClick={() => addToCart(product)}>Add to Cart</Button>
            </div>
            
            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
              <Button 
                variant="ghost" 
                className={`flex items-center gap-2 ${liked ? 'text-pink-600' : 'text-gray-600'}`}
                onClick={() => toggleItem(product)}
              >
                {liked ? <HiHeart className="w-5 h-5 text-pink-500" /> : <HiOutlineHeart className="w-5 h-5" />}
                {liked ? 'Added to Wishlist' : 'Save to Wishlist'}
              </Button>
            </div>

            {/* Seller Info inline */}
            <div className="mt-8 bg-gray-50 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between border border-gray-100 gap-4">
              <div className="flex items-center gap-4">
                <Avatar name={product.seller?.name || 'Seller'} size="lg" />
                <div>
                  <p className="text-gray-900 font-bold text-base">{product.seller?.name || 'Seller'}</p>
                  <p className="text-emerald-600 text-sm flex items-center gap-1 mt-0.5"><HiCheckCircle className="w-4 h-4" /> Verified Vendor</p>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-gray-900 font-extrabold text-lg">{product.seller?.totalSales || 0}</p>
                  <p className="text-gray-500 text-xs font-semibold tracking-wider">SALES</p>
                </div>
                <div>
                  <p className="text-gray-900 font-extrabold text-lg">{(product.seller?.ratings || 0).toFixed(1)}</p>
                  <p className="text-gray-500 text-xs font-semibold tracking-wider">RATING</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section — Reviews */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <p className="text-gray-500 mt-1">See what others are saying about {product.title}</p>
          </div>
          <div className="text-left sm:text-right">
            <div className="flex items-center gap-2 sm:justify-end mb-1">
              <Rating value={product.ratings || 0} />
              <span className="text-2xl font-bold text-gray-900">{(product.ratings || 0).toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-500">Based on {product.totalReviews || 0} reviews</span>
          </div>
        </div>
        
        {canReview && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <HiStar
                      key={star}
                      className={`w-8 h-8 cursor-pointer transition-colors ${reviewForm.rating >= star ? 'text-amber-400' : 'text-gray-300'}`}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="What did you like or dislike about this product?"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
              </div>
              <div className="text-right">
                <Button type="submit" disabled={isSubmittingReview}>
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No reviews yet. Be the first to review this product!</p>
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
