import { useRef } from 'react';
import { 
  HiFilm, 
  HiLightningBolt, 
  HiShieldCheck, 
  HiAcademicCap, 
  HiCloud, 
  HiMusicNote, 
  HiCog, 
  HiPuzzle, 
  HiCollection, 
  HiChevronLeft, 
  HiChevronRight 
} from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getPublicStats } from '../../services/public.service';

const categories = [
  { value: 'bundles', label: 'Bundles & Deals', subtitle: 'Combo Packs', icon: HiCollection, color: '#A855F7', bg: 'from-purple-500/15 to-purple-600/5', text: 'text-purple-600', border: 'border-purple-200/60' },
  { value: 'ott', label: 'OTT Platforms', subtitle: '120+ Services', icon: HiFilm, color: '#5B4BFF', bg: 'from-indigo-500/15 to-indigo-600/5', text: 'text-[#5B4BFF]', border: 'border-indigo-200/60' },
  { value: 'gaming', label: 'Games & Accounts', subtitle: '50+ Services', icon: HiPuzzle, color: '#10B981', bg: 'from-emerald-500/15 to-emerald-600/5', text: 'text-emerald-600', border: 'border-emerald-200/60' },
  { value: 'ai-tools', label: 'AI & Productivity', subtitle: '80+ Services', icon: HiLightningBolt, color: '#3B82F6', bg: 'from-blue-500/15 to-blue-600/5', text: 'text-blue-600', border: 'border-blue-200/60' },
  { value: 'vpn', label: 'VPN & Security', subtitle: '70+ Services', icon: HiShieldCheck, color: '#06B6D4', bg: 'from-cyan-500/15 to-cyan-600/5', text: 'text-cyan-600', border: 'border-cyan-200/60' },
  { value: 'education', label: 'Education & Learning', subtitle: '80+ Services', icon: HiAcademicCap, color: '#F59E0B', bg: 'from-amber-500/15 to-amber-600/5', text: 'text-amber-600', border: 'border-amber-200/60' },
  { value: 'cloud-storage', label: 'Cloud & Storage', subtitle: '50+ Services', icon: HiCloud, color: '#6366F1', bg: 'from-indigo-500/15 to-slate-500/5', text: 'text-indigo-600', border: 'border-indigo-200/60' },
  { value: 'music', label: 'Music & Audio', subtitle: '40+ Services', icon: HiMusicNote, color: '#EC4899', bg: 'from-pink-500/15 to-pink-600/5', text: 'text-pink-600', border: 'border-pink-200/60' },
  { value: 'software', label: 'Software & Tools', subtitle: '70+ Services', icon: HiCog, color: '#8B5CF6', bg: 'from-violet-500/15 to-violet-600/5', text: 'text-violet-600', border: 'border-violet-200/60' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } }
};

const CategoryFilter = ({ selected, onSelect, variant = 'cards' }) => {
  const { data } = useQuery({
    queryKey: ['publicStats'],
    queryFn: async () => {
      const res = await getPublicStats();
      return res.data;
    }
  });

  const categoryCounts = data?.categories || {};
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (variant === 'cards') {
    return (
      <div className="relative group">
        {/* Navigation Buttons */}
        <button 
          onClick={scrollLeft}
          aria-label="Scroll Left"
          className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-white/95 backdrop-blur-md rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.12)] border border-slate-200/80 flex items-center justify-center z-20 text-slate-600 hover:text-slate-900 hover:scale-110 active:scale-95 transition-all sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
        >
          <HiChevronLeft className="w-5 h-5" />
        </button>

        <button 
          onClick={scrollRight}
          aria-label="Scroll Right"
          className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-white/95 backdrop-blur-md rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.12)] border border-slate-200/80 flex items-center justify-center z-20 text-slate-600 hover:text-slate-900 hover:scale-110 active:scale-95 transition-all sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
        >
          <HiChevronRight className="w-5 h-5" />
        </button>

        <motion.div 
          ref={scrollContainerRef}
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="flex gap-3.5 sm:gap-4.5 overflow-x-auto scroll-smooth snap-x snap-mandatory py-3 px-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {categories.map((cat) => {
            const isSelected = selected === cat.value;
            const count = categoryCounts[cat.value] || 0;
            return (
              <motion.button
                variants={item}
                key={cat.value}
                onClick={() => onSelect(isSelected ? '' : cat.value)}
                className={`group/card relative flex flex-col items-center justify-center p-4 sm:p-5 w-[140px] sm:w-[165px] shrink-0 snap-start rounded-[22px] sm:rounded-[26px] transition-all duration-300 overflow-hidden border cursor-pointer ${
                  isSelected
                    ? 'bg-white shadow-[0_12px_32px_rgba(91,75,255,0.18)] border-[#5B4BFF] ring-2 ring-[#5B4BFF]/20 -translate-y-1.5'
                    : 'bg-white/90 backdrop-blur-sm border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] hover:border-slate-300 hover:-translate-y-1'
                }`}
              >
                {/* Active Indicator & Glow */}
                {isSelected && (
                  <div 
                    className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#5B4BFF] to-[#A855F7] shadow-[0_2px_8px_#5B4BFF]"
                  />
                )}

                {/* Animated Icon Well */}
                <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-[18px] bg-gradient-to-br ${cat.bg} border ${cat.border} flex items-center justify-center mb-3.5 transition-all duration-300 group-hover/card:scale-110 group-hover/card:rotate-2 shadow-xs`}>
                  {cat.icon && <cat.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${cat.text} drop-shadow-xs`} />}
                </div>
                
                <p className="text-[13px] sm:text-[14px] font-extrabold text-slate-800 mb-1 text-center leading-tight tracking-tight group-hover/card:text-[#5B4BFF] transition-colors">
                  {cat.label}
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100/80 text-slate-500 group-hover/card:bg-slate-100 group-hover/card:text-slate-700 transition-colors">
                  {count} {count === 1 ? 'service' : 'services'}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    );
  }

  // Pill variant for sidebar/filters
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const isSelected = selected === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => onSelect(cat.value)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] sm:text-[13px] font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              isSelected
                ? 'bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED] text-white shadow-[0_4px_14px_rgba(91,75,255,0.35)] scale-102'
                : 'bg-white/90 text-slate-600 border border-slate-200/90 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {cat.icon && <cat.icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : cat.text}`} />}
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
