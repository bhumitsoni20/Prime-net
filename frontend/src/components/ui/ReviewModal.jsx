import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiStar, HiOutlineStar } from 'react-icons/hi';
import Button from './Button';

const ReviewModal = ({ isOpen, onClose, onSubmit, otherUserName, bundleProducts }) => {
  // If bundleProducts is provided, it's a bundle review
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  
  // For bundles
  const [productRatings, setProductRatings] = useState({});

  const handleProductRating = (productId, val) => {
    setProductRatings(prev => ({ ...prev, [productId]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (bundleProducts && bundleProducts.length > 0) {
      onSubmit({ rating, comment: reviewComment, productRatings });
    } else {
      onSubmit({ rating, comment: reviewComment });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-[24px] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] w-full max-w-md border border-[#E2E8F0] relative overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 z-10" />
            
            <div className="p-6 pb-2 shrink-0">
              <div className="w-14 h-14 bg-amber-50 rounded-[16px] flex items-center justify-center mb-4 mx-auto mt-2">
                <span className="text-3xl">🌟</span>
              </div>
              <h2 className="text-[22px] font-extrabold text-center text-[#0F172A] mb-1 tracking-tight">Rate Your Experience</h2>
              <p className="text-center text-[#64748B] text-[14px] mb-4">How was your experience with {otherUserName || 'this seller'}?</p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden p-6 pt-0 space-y-5">
              <div className="shrink-0">
                <label className="block text-[11px] font-bold text-[#64748B] mb-2 uppercase tracking-[0.08em] text-center">Overall Seller Rating</label>
                <div className="flex justify-center gap-2 bg-[#F8FAFC] py-3 rounded-[16px] border border-[#F1F5F9]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      {star <= (hoverRating || rating) ? (
                        <HiStar className="w-8 h-8 text-amber-400 drop-shadow-sm" />
                      ) : (
                        <HiOutlineStar className="w-8 h-8 text-[#CBD5E1]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {bundleProducts && bundleProducts.length > 0 && (
                <div className="flex flex-col min-h-0">
                  <label className="block text-[11px] font-bold text-[#64748B] mb-2 uppercase tracking-[0.08em]">Product Ratings</label>
                  <div className="space-y-2.5 overflow-y-auto pr-1 shrink scrollbar-thin scrollbar-thumb-[#CBD5E1] scrollbar-track-transparent">
                    {bundleProducts.map(bp => {
                      const pId = bp.product?._id;
                      const pTitle = bp.product?.title;
                      const currentRating = productRatings[pId] || 0;
                      return (
                        <div key={pId} className="flex items-center justify-between bg-[#F8FAFC] p-2.5 rounded-[10px] border border-[#F1F5F9]">
                          <span className="text-[13px] font-semibold text-[#0F172A] truncate pr-3">{pTitle}</span>
                          <div className="flex gap-0.5 shrink-0">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110 active:scale-95 p-0.5"
                                onClick={() => handleProductRating(pId, star)}
                              >
                                {star <= currentRating ? (
                                  <HiStar className="w-4 h-4 text-amber-400 drop-shadow-sm" />
                                ) : (
                                  <HiOutlineStar className="w-4 h-4 text-[#CBD5E1]" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="shrink-0">
                <label className="block text-[11px] font-bold text-[#64748B] mb-2 uppercase tracking-[0.08em]">Write a Review (Optional)</label>
                <textarea rows="2" value={reviewComment} onChange={e=>setReviewComment(e.target.value)} placeholder="Describe your experience with this seller..." className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] focus:bg-white focus:ring-[2px] focus:ring-[#5B4BFF]/20 focus:border-[#5B4BFF] outline-none transition-all resize-none text-[#0F172A] text-[13px] placeholder-[#94A3B8]"></textarea>
              </div>

              <div className="flex gap-3 pt-2 shrink-0">
                <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Skip</Button>
                <Button type="submit" className="flex-1 shadow-[0_4px_14px_rgba(91,75,255,0.3)]">Submit Review</Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;
