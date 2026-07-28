import { useRef } from 'react';
import { HiFilm, HiLightningBolt, HiShieldCheck, HiAcademicCap, HiCloud, HiMusicNote, HiCog, HiPuzzle } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getPublicStats } from '../../services/public.service';

const categories = [
  { value: 'ott', label: 'OTT Platforms', subtitle: '120+ Services', icon: HiFilm, color: '#5B4BFF', bg: 'bg-[#5B4BFF]/10', text: 'text-[#5B4BFF]' },
  { value: 'gaming', label: 'Games & Accounts', subtitle: '50+ Services', icon: HiPuzzle, color: '#10B981', bg: 'bg-[#10B981]/10', text: 'text-[#10B981]' },
  { value: 'ai-tools', label: 'AI & Productivity', subtitle: '80+ Services', icon: HiLightningBolt, color: '#3B82F6', bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]' },
  { value: 'vpn', label: 'VPN & Security', subtitle: '70+ Services', icon: HiShieldCheck, color: '#22C55E', bg: 'bg-[#22C55E]/10', text: 'text-[#22C55E]' },
  { value: 'education', label: 'Education & Learning', subtitle: '80+ Services', icon: HiAcademicCap, color: '#F59E0B', bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]' },
  { value: 'cloud-storage', label: 'Cloud & Storage', subtitle: '50+ Services', icon: HiCloud, color: '#64748B', bg: 'bg-[#64748B]/10', text: 'text-[#64748B]' },
  { value: 'music', label: 'Music & Audio', subtitle: '40+ Services', icon: HiMusicNote, color: '#EC4899', bg: 'bg-[#EC4899]/10', text: 'text-[#EC4899]' },
  { value: 'software', label: 'Software & Tools', subtitle: '70+ Services', icon: HiCog, color: '#8B5CF6', bg: 'bg-[#8B5CF6]/10', text: 'text-[#8B5CF6]' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
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
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (variant === 'cards') {
    return (
      <div className="relative group">
        <button 
          onClick={scrollLeft}
          className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.15)] flex items-center justify-center z-10 text-[#64748B] hover:text-[#0F172A] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        <button 
          onClick={scrollRight}
          className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.15)] flex items-center justify-center z-10 text-[#64748B] hover:text-[#0F172A] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>

        <motion.div 
          ref={scrollContainerRef}
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {categories.map((cat) => (
            <motion.button
              variants={item}
              key={cat.value}
              onClick={() => onSelect(selected === cat.value ? '' : cat.value)}
              className={`group relative flex flex-col items-center justify-center p-6 w-[160px] shrink-0 snap-start rounded-[24px] bg-white transition-all duration-300 overflow-hidden ${
              selected === cat.value
                ? 'shadow-[0_8px_30px_rgba(0,0,0,0.08)] -translate-y-1'
                : 'shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1'
            }`}
          >
            {/* Bottom Border Line */}
            <div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 rounded-t-full transition-all duration-300"
              style={{ 
                width: selected === cat.value ? '80%' : '60%', 
                backgroundColor: cat.color,
                opacity: selected === cat.value ? 1 : 0.6
              }}
            />
            
            <div className={`w-14 h-14 rounded-[16px] ${cat.bg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
              {cat.icon && <cat.icon className={`w-7 h-7 ${cat.text}`} />}
            </div>
            
            <p className="text-[14px] font-bold text-[#0F172A] mb-1.5 text-center leading-tight">
              {cat.label}
            </p>
            <p className="text-[12px] font-medium text-[#94A3B8] text-center">
              {categoryCounts[cat.value] || 0} {categoryCounts[cat.value] === 1 ? 'Service' : 'Services'}
            </p>
          </motion.button>
        ))}
      </motion.div>
    </div>
    );
  }

  // Pill variant for sidebar/filters
  return (
    <div className="flex flex-wrap gap-2.5">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onSelect(cat.value)}
          className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 ${
            selected === cat.value
              ? 'bg-[#5B4BFF] text-white shadow-[0_2px_8px_rgba(91,75,255,0.3)] hover:bg-[#4F3FE8]'
              : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#CBD5E1] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
