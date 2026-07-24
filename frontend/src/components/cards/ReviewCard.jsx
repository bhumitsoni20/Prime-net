import Avatar from '../ui/Avatar';
import Rating from '../ui/Rating';

const ReviewCard = ({ review }) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 transition-all duration-200 hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar src={review.user?.avatar} name={review.user?.name} size="sm" />
          <div>
            <p className="text-[#0F172A] text-sm font-semibold">{review.user?.name}</p>
            <p className="text-[#94A3B8] text-[11px] font-medium">{review.user?.title || 'Verified Buyer'}</p>
          </div>
        </div>
        <span className="text-[#94A3B8] text-[11px] font-medium">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      <Rating value={review.rating} size="sm" showValue={false} />
      {review.comment && <p className="text-[#475569] text-sm mt-3 leading-relaxed">"{review.comment}"</p>}
    </div>
  );
};

export default ReviewCard;
