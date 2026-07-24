import { HiFilm, HiLightningBolt, HiShieldCheck, HiAcademicCap, HiDesktopComputer, HiCloud, HiStar } from 'react-icons/hi';

const categories = [
  { value: '', label: 'All', icon: null, color: 'bg-gradient-to-r from-[#94A3B8] to-[#64748B]' },
  { value: 'ott', label: 'OTT Platforms', icon: HiFilm, color: 'bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED]' },
  { value: 'ai-tools', label: 'AI & Productivity', icon: HiLightningBolt, color: 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB]' },
  { value: 'vpn', label: 'VPN & Security', icon: HiShieldCheck, color: 'bg-gradient-to-r from-[#22C55E] to-[#16A34A]' },
  { value: 'education', label: 'Education & Learning', icon: HiAcademicCap, color: 'bg-gradient-to-r from-[#F59E0B] to-[#D97706]' },
  { value: 'software', label: 'Company Use', icon: HiDesktopComputer, color: 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED]' },
  { value: 'cloud-storage', label: 'Cloud & Storage', icon: HiCloud, color: 'bg-gradient-to-r from-[#0EA5E9] to-[#0284C7]' },
  { value: 'premium-membership', label: 'Music & Audio', icon: HiStar, color: 'bg-gradient-to-r from-[#EC4899] to-[#DB2777]' },
];

const CategoryFilter = ({ selected, onSelect, variant = 'cards' }) => {
  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categories.filter(c => c.value).map((cat) => (
          <button
            key={cat.value}
            onClick={() => onSelect(selected === cat.value ? '' : cat.value)}
            className={`group relative flex flex-col items-start gap-4 p-5 rounded-[20px] border transition-all duration-300 hover-lift text-left overflow-hidden ${
              selected === cat.value
                ? 'border-[#5B4BFF]/30 bg-[#5B4BFF]/[0.02] shadow-[0_4px_20px_-4px_rgba(91,75,255,0.15)]'
                : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
            }`}
          >
            {selected === cat.value && (
              <div className="absolute inset-0 bg-gradient-to-b from-[#5B4BFF]/5 to-transparent pointer-events-none" />
            )}
            <div className={`h-11 w-11 rounded-[14px] ${selected === cat.value ? 'bg-[#5B4BFF]/10' : 'bg-[#F1F5F9]'} flex items-center justify-center transition-colors duration-300`}>
              {cat.icon && <cat.icon className={`w-[22px] h-[22px] ${selected === cat.value ? 'text-[#5B4BFF]' : 'text-[#64748B] group-hover:text-[#475569]'}`} />}
            </div>
            <div className="w-full">
              <p className={`text-[15px] font-semibold mb-3 ${selected === cat.value ? 'text-[#0F172A]' : 'text-[#334155]'}`}>
                {cat.label}
              </p>
              <div className={`h-[3px] w-full rounded-full ${selected === cat.value ? 'bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED]' : cat.color} opacity-80`} />
            </div>
          </button>
        ))}
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
