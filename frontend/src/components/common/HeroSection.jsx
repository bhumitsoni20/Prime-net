import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { HiShieldCheck, HiSparkles } from 'react-icons/hi';
import { FiShield, FiPackage, FiShoppingBag, FiMessageSquare, FiZap, FiCheckCircle } from 'react-icons/fi';
import SearchBar from '../ui/SearchBar';
import { getPublicStats } from '../../services/public.service';
import { AuroraBackground, ShinyText, Magnet, CountUp } from '../reactbits';

const FloatingIcon = ({ icon, color, delay, xOffset, yOffset, size = 60 }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ 
      y: [-12, 12, -12],
      rotate: [-6, 6, -6]
    }}
    transition={{ 
      duration: 5.5, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay: delay 
    }}
    className={`absolute rounded-[24px] shadow-[0_16px_36px_-6px_rgba(91,75,255,0.18)] border border-white/80 backdrop-blur-md flex items-center justify-center bg-white/90 ${color}`}
    style={{ 
      width: size, 
      height: size, 
      left: `calc(50% + ${xOffset}px)`, 
      top: `calc(50% + ${yOffset}px)`,
      zIndex: 30
    }}
  >
    {icon}
  </motion.div>
);

const HeroSection = ({ onSearch }) => {
  const { data: stats } = useQuery({
    queryKey: ['publicStats'],
    queryFn: async () => {
      const response = await getPublicStats();
      return response.data;
    },
  });

  const rawUserCount = stats?.totalUsers !== undefined ? stats.totalUsers : 4;

  return (
    <AuroraBackground className="pt-4 pb-0 lg:pt-8 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-xl text-[#5B4BFF] border border-[#5B4BFF]/20 rounded-full px-4 py-2 text-[13px] font-bold mb-6 shadow-[0_4px_20px_rgba(91,75,255,0.1)]"
              >
                <HiSparkles className="w-4 h-4 text-[#A855F7] animate-pulse" />
                <span>
                  Trusted by <CountUp to={rawUserCount} duration={2} suffix="+" className="font-extrabold text-[#0F172A]" /> users worldwide
                </span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-[42px] sm:text-[58px] lg:text-[66px] font-extrabold text-[#0F172A] leading-[1.08] tracking-[-0.035em] mb-6"
              >
                Your Digital World,<br />
                <ShinyText text="All in One Place" speed={3.5} className="font-black" />
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-[#64748B] text-[18px] sm:text-[20px] mb-10 leading-relaxed max-w-lg font-medium"
              >
                Discover, compare and subscribe to verified digital services at unbeatable prices with instant 1-click wallet delivery.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative max-w-lg mb-10"
              >
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-[22px] bg-gradient-to-r from-[#5B4BFF] via-[#A855F7] to-[#3B82F6] opacity-30 blur-lg group-hover:opacity-60 transition duration-500" />
                  <div className="relative bg-white rounded-[20px] shadow-lg">
                    <SearchBar onSearch={onSearch} className="w-full" size="lg" buttonText="Search" buttonColor="primary" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap items-center gap-6 text-[#334155]"
              >
                <Magnet magnetStrength={0.25}>
                  <div className="flex items-center gap-2 text-[14px] font-bold bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/80 shadow-xs cursor-default">
                    <div className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center shadow-xs">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    Verified Sellers
                  </div>
                </Magnet>

                <Magnet magnetStrength={0.25}>
                  <div className="flex items-center gap-2 text-[14px] font-bold bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/80 shadow-xs cursor-default">
                    <div className="w-5 h-5 rounded-[6px] bg-transparent border-2 border-[#5B4BFF] flex items-center justify-center text-[#5B4BFF]">
                      <HiShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    24h Refunds
                  </div>
                </Magnet>

                <Magnet magnetStrength={0.25}>
                  <div className="flex items-center gap-2 text-[14px] font-bold bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/80 shadow-xs cursor-default">
                    <div className="w-5 h-5 rounded-[6px] bg-amber-500 flex items-center justify-center text-white shadow-xs">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" /></svg>
                    </div>
                    Instant Delivery
                  </div>
                </Magnet>
              </motion.div>
            </div>

            {/* Right Content - 3D Specular Floating Hub */}
            <div className="relative h-[420px] sm:h-[520px] lg:h-[620px] hidden sm:block">
              <motion.div 
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {/* Multi-layered dynamic halos */}
                <div className="w-[360px] h-[360px] rounded-full bg-gradient-to-tr from-[#5B4BFF]/30 via-[#A855F7]/25 to-[#38BDF8]/20 blur-[60px] animate-pulse" />
                
                {/* Main Center Specular Glass Hub Card */}
                <motion.div 
                  animate={{ y: [-14, 14, -14], rotate: [-2, 2, -2] }}
                  transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute z-20 flex items-center justify-center"
                >
                  <div className="relative w-72 h-72">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-[#5B4BFF] via-[#A855F7] to-[#38BDF8] rounded-[36px] blur-lg opacity-40" />
                    <div className="relative inset-0 bg-white/90 backdrop-blur-2xl rounded-[34px] shadow-[0_25px_60px_rgba(91,75,255,0.22)] flex flex-col items-center justify-center border border-white/90 p-8 rotate-[-3deg]">
                      <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#5B4BFF] to-[#7C3AED] flex items-center justify-center text-white shadow-[0_12px_28px_rgba(91,75,255,0.35)] mb-4">
                        <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                      </div>
                      <span className="text-[16px] font-extrabold text-[#0F172A] tracking-tight">StreamKart Hub</span>
                      <span className="text-[12px] font-semibold text-[#5B4BFF] bg-[#EEF2FF] px-2.5 py-0.5 rounded-full mt-1">Instant Digital Pass</span>
                    </div>
                  </div>
                </motion.div>

                {/* Floating 3D React Bits Badges */}
                <FloatingIcon delay={0} xOffset={-150} yOffset={-130} size={76} icon={
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                    <FiShield className="w-6 h-6 text-indigo-600" />
                  </div>
                } />
                
                <FloatingIcon delay={1} xOffset={120} yOffset={-150} size={84} icon={
                  <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                    <FiCheckCircle className="w-7 h-7 text-emerald-600" />
                  </div>
                } />

                <FloatingIcon delay={2} xOffset={140} yOffset={50} size={70} icon={
                  <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center">
                    <FiZap className="w-5 h-5 text-amber-500" />
                  </div>
                } />

                <FloatingIcon delay={1.5} xOffset={-160} yOffset={90} size={88} icon={
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                    <FiPackage className="w-8 h-8 text-blue-500" />
                  </div>
                } />

                <FloatingIcon delay={2.5} xOffset={0} yOffset={-180} size={78} icon={
                  <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
                    <FiShoppingBag className="w-6 h-6 text-rose-500" />
                  </div>
                } />

                <FloatingIcon delay={1.2} xOffset={90} yOffset={150} size={74} icon={
                  <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                    <FiMessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                } />

              </motion.div>
            </div>

          </div>
        </div>
    </AuroraBackground>
  );
};

export default HeroSection;
