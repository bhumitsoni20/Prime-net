import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import SearchBar from '../ui/SearchBar';
import { HiShieldCheck, HiSparkles } from 'react-icons/hi';
import { SiCanva } from 'react-icons/si';
import { useQuery } from '@tanstack/react-query';
import { getPublicStats } from '../../services/public.service';
import { motion } from 'framer-motion';

const FloatingIcon = ({ icon, color, delay, xOffset, yOffset, size = 60 }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ 
      y: [-10, 10, -10],
      rotate: [-5, 5, -5]
    }}
    transition={{ 
      duration: 5, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay: delay 
    }}
    className={`absolute rounded-[24px] shadow-2xl flex items-center justify-center bg-white ${color}`}
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

  const userCountText = stats?.totalUsers !== undefined
    ? `${stats.totalUsers.toLocaleString()}+` 
    : '4+'; // Matching design exactly "Trusted by 4+ users worldwide"

  return (
    <section className="relative overflow-hidden bg-[#FAFBFF] pt-4 pb-0 lg:pt-8 lg:pb-0">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#5B4BFF]/[0.05] blur-[100px]" />
        <div className="absolute top-[10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#7C3AED]/[0.05] blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-[#F3F1FF] text-[#5B4BFF] rounded-full px-4 py-2 text-[13px] font-bold mb-6"
            >
              <HiSparkles className="w-4 h-4" />
              Trusted by {userCountText} users worldwide
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[40px] sm:text-[56px] lg:text-[64px] font-extrabold text-[#0F172A] leading-[1.1] tracking-[-0.03em] mb-6"
            >
              Your Digital World,<br />
              <span className="bg-gradient-to-r from-[#5B4BFF] to-[#A855F7] text-transparent bg-clip-text">All in One Place</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[#64748B] text-[18px] sm:text-[20px] mb-10 leading-relaxed max-w-lg"
            >
              Discover, compare and subscribe to premium digital services at unbeatable prices. Fast, secure and reliable.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative max-w-lg mb-10"
            >
              <SearchBar onSearch={onSearch} className="w-full" size="lg" buttonText="Search" buttonColor="primary" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 text-[#334155]"
            >
              <span className="flex items-center gap-2 text-[14px] font-bold">
                <div className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                Verified Sellers
              </span>
              <span className="flex items-center gap-2 text-[14px] font-bold">
                <div className="w-5 h-5 rounded-[6px] bg-transparent border-2 border-[#5B4BFF] flex items-center justify-center text-[#5B4BFF]">
                  <HiShieldCheck className="w-3.5 h-3.5" />
                </div>
                Secure Payments
              </span>
              <span className="flex items-center gap-2 text-[14px] font-bold">
                <div className="w-5 h-5 rounded-[6px] bg-transparent flex items-center justify-center text-[#F59E0B]">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" /></svg>
                </div>
                Instant Delivery
              </span>
            </motion.div>
          </div>

          {/* Right Content - Abstract Floating Illustration */}
          <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] hidden sm:block">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Main glowing orb behind cart */}
              <div className="w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-[#5B4BFF]/20 to-[#A855F7]/20 blur-[40px]" />
              
              {/* Main Center Image/Icon (The Cart) */}
              <motion.div 
                animate={{ y: [-15, 15, -15] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute z-20 flex items-center justify-center"
              >
                <div className="relative w-64 h-64">
                   <div className="absolute inset-0 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(91,75,255,0.15)] flex items-center justify-center border border-[#F1F5F9] rotate-[-5deg]">
                     <div className="w-32 h-32 text-[#5B4BFF]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                     </div>
                   </div>
                </div>
              </motion.div>

              {/* Floating App Icons */}
              <FloatingIcon delay={0} xOffset={-140} yOffset={-120} size={70} icon={
                <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" alt="Spotify" className="w-10 h-10 object-contain" />
              } />
              
              <FloatingIcon delay={1} xOffset={100} yOffset={-150} size={80} icon={
                <img src="https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.png" alt="Netflix" className="w-10 h-10 object-contain rounded-md" />
              } />

              <FloatingIcon delay={2} xOffset={120} yOffset={40} size={65} icon={
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" alt="YouTube" className="w-10 h-10 object-contain" />
              } />

              <FloatingIcon delay={1.5} xOffset={-150} yOffset={80} size={85} icon={
                <img src="https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg" alt="Prime Video" className="w-16 h-16 object-contain" />
              } />

              <FloatingIcon delay={2.5} xOffset={0} yOffset={-170} size={75} icon={
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" alt="ChatGPT" className="w-10 h-10 object-contain" />
              } />

              <FloatingIcon delay={1.2} xOffset={80} yOffset={140} size={70} icon={
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00C4CC] to-[#7D2AE8] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]">
                  <SiCanva className="w-8 h-8 text-white" />
                </div>
              } />

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
