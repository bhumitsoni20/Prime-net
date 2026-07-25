import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiStar, HiOutlineStar } from 'react-icons/hi';
import Button from './Button';

const ReviewModal = ({ isOpen, onClose, onSubmit, otherUserName }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, comment: reviewComment });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-[24px] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] p-8 w-full max-w-md border border-[#E2E8F0] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="w-20 h-20 bg-amber-50 rounded-[20px] flex items-center justify-center mb-6 mx-auto">
              <span className="text-4xl">🌟</span>
            </div>
            <h2 className="text-[24px] font-extrabold text-center text-[#0F172A] mb-2 tracking-tight">Rate Your Experience</h2>
            <p className="text-center text-[#64748B] text-[15px] mb-8">How was your experience with {otherUserName || 'this seller'}?</p>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-center gap-3 bg-[#F8FAFC] py-6 rounded-[20px] border border-[#F1F5F9]">
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
                      <HiStar className="w-[42px] h-[42px] text-amber-400 drop-shadow-sm" />
                    ) : (
                      <HiOutlineStar className="w-[42px] h-[42px] text-[#CBD5E1]" />
                    )}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#64748B] mb-2 uppercase tracking-[0.08em]">Write a Review (Optional)</label>
                <textarea rows="4" value={reviewComment} onChange={e=>setReviewComment(e.target.value)} placeholder="Describe your experience with this seller..." className="w-full px-5 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] focus:bg-white focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] outline-none transition-all resize-none text-[#0F172A] placeholder-[#94A3B8]"></textarea>
              </div>

              <div className="flex gap-4 pt-2">
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
