import { HiStar } from 'react-icons/hi';

const Rating = ({ value = 0, max = 5, size = 'sm' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <HiStar
          key={i}
          className={`${sizes[size]} transition-colors duration-150 ${
            i < Math.round(value) ? 'text-amber-400' : 'text-[#E2E8F0]'
          }`}
        />
      ))}
    </div>
  );
};

export default Rating;
