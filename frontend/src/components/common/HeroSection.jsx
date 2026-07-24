import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import SearchBar from '../ui/SearchBar';
import { HiShieldCheck } from 'react-icons/hi';
import { useQuery } from '@tanstack/react-query';
import { getPublicStats } from '../../services/public.service';

const HeroSection = ({ onSearch }) => {
  const { data: stats } = useQuery({
    queryKey: ['publicStats'],
    queryFn: async () => {
      const response = await getPublicStats();
      return response.data;
    },
  });

  const userCountText = stats?.totalUsers !== undefined
    ? `${stats.totalUsers.toLocaleString()}+` 
    : '50k+';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F8FAFC]">
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-[#5B4BFF]/[0.04] blur-[80px]" />
        <div className="absolute top-[-10%] right-[15%] w-[400px] h-[400px] rounded-full bg-[#7C3AED]/[0.04] blur-[80px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#5B4BFF]/[0.03] blur-[100px]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%235B4BFF\' fill-opacity=\'1\'%3E%3Cpath d=\'M0 0h1v1H0V0zm20 0h1v1h-1V0zM0 20h1v1H0v-1zm20 0h1v1h-1v-1z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 bg-[#5B4BFF]/[0.06] border border-[#5B4BFF]/10 text-[#5B4BFF] rounded-full px-4 py-1.5 text-[13px] font-semibold mb-6 animate-fadeIn">
          <span className="h-1.5 w-1.5 rounded-full bg-[#5B4BFF] animate-pulse" />
          Trusted by {userCountText} users worldwide
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-[#0F172A] mb-5 leading-[1.1] tracking-[-0.03em] animate-slideUp text-balance">
          Empower Your<br />
          <span className="gradient-text">Digital Lifestyle.</span>
        </h1>

        <p className="text-[#64748B] text-lg max-w-xl mx-auto mb-8 animate-slideUp animate-stagger-1 leading-relaxed">
          Discover and manage premium digital subscriptions in one seamless platform.
        </p>

        <SearchBar onSearch={onSearch} className="max-w-xl mx-auto mb-8 animate-slideUp animate-stagger-2" />

        <div className="flex items-center justify-center gap-6 text-[#94A3B8] animate-slideUp animate-stagger-3">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <HiShieldCheck className="w-4 h-4 text-[#22C55E]" />
            Verified sellers
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <HiShieldCheck className="w-4 h-4 text-[#5B4BFF]" />
            Secure payments
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <HiShieldCheck className="w-4 h-4 text-[#F59E0B]" />
            Instant delivery
          </span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
