import {
  useOutlet,
  Link,
  useLocation,
  ScrollRestoration,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getPublicStats } from '../../services/public.service';
import {
  HiLightningBolt,
  HiSparkles,
  HiArrowLeft,
} from 'react-icons/hi';
import { BorderBeam, CountUp, ShapeGrid } from '../reactbits';

const AuthLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const isLogin =
    location.pathname === '/login' ||
    location.pathname === '/phone-login' ||
    location.pathname === '/forgot-password';

  const { data: stats } = useQuery({
    queryKey: ['publicStats'],
    queryFn: async () => {
      const response = await getPublicStats();
      return response.data;
    },
    retry: 1,
    staleTime: 10 * 60 * 1000,
  });

  const rawUserCount = stats?.totalUsers !== undefined ? stats.totalUsers : 4500;

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 flex flex-col justify-between relative select-none overflow-x-hidden">
      
      {/* Dynamic ReactBits ShapeGrid & Ambient Glow Engine */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        
        {/* Layer 1: ReactBits Interactive Moving ShapeGrid */}
        <ShapeGrid
          shape="square"
          direction="diagonal"
          speed={0.6}
          squareSize={44}
          borderColor="rgba(91, 75, 255, 0.2)"
          hoverFillColor="rgba(91, 75, 255, 0.25)"
          hoverTrailAmount={5}
          className="absolute inset-0 w-full h-full"
        />

        {/* Layer 2: Central Ambient Radiant Halo behind card */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-[#5B4BFF]/15 via-[#8B5CF6]/12 to-[#38BDF8]/12 blur-[140px]" />
        
        {/* Layer 3: Floating Organic Pastel Aurora Orbs */}
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -35, 25, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="pointer-events-none absolute -top-32 -left-20 w-[550px] h-[500px] rounded-full bg-gradient-to-br from-[#5B4BFF]/18 via-[#7C3AED]/14 to-transparent blur-[140px]"
        />

        <motion.div
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -30, 0],
            scale: [1, 1.08, 0.92, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="pointer-events-none absolute -bottom-36 -right-24 w-[600px] h-[550px] rounded-full bg-gradient-to-tl from-[#38BDF8]/16 via-[#A855F7]/14 to-[#EC4899]/10 blur-[150px]"
        />

      </div>

      {/* Top Navigation Bar with Large Logo */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4 sm:py-5 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-95 transition-all hover:scale-[1.02]">
          <img
            src="/streamkart-logo-nav.png"
            alt="StreamKart"
            className="h-16 sm:h-20 md:h-24 w-auto max-w-[280px] sm:max-w-[340px] md:max-w-[380px] object-contain drop-shadow-md"
          />
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 hover:bg-white border border-slate-200/90 text-xs sm:text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-all backdrop-blur-md shadow-xs group hover:shadow-md"
        >
          <HiArrowLeft className="w-4 h-4 text-[#5B4BFF] transition-transform group-hover:-translate-x-1" />
          <span>Back to marketplace</span>
        </Link>
      </header>

      {/* Center Floating Portrait Auth Card */}
      <main className="relative z-10 w-full max-w-[540px] sm:max-w-[580px] mx-auto px-4 sm:px-6 my-auto py-4">
        
        {/* Main Portrait Card */}
        <div className="relative rounded-[28px] sm:rounded-[32px] bg-white/95 border border-slate-200/90 shadow-[0_25px_70px_-15px_rgba(91,75,255,0.15),0_4px_18px_rgba(0,0,0,0.04)] p-7 sm:p-10 overflow-hidden backdrop-blur-xl">
          
          {/* Animated Border Beam */}
          <BorderBeam
            size={360}
            duration={9}
            borderWidth={1.5}
            colorFrom="#5B4BFF"
            colorTo="#7C3AED"
          />

          {/* Top Switcher inside card */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="inline-flex items-center gap-1.5 text-[#5B4BFF] text-[11px] font-extrabold uppercase tracking-wider">
              <HiSparkles className="w-3.5 h-3.5" />
              <span>StreamKart Auth</span>
            </div>

            {/* Quick Segmented Tab Switcher */}
            <div className="relative flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/80">
              <div
                className={`absolute top-1 bottom-1 w-[72px] bg-white rounded-full shadow-xs transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  isLogin ? 'translate-x-0' : 'translate-x-[72px]'
                }`}
              />
              <Link
                to="/login"
                className={`relative z-10 w-[72px] text-center py-1 text-xs font-extrabold transition-colors ${
                  isLogin ? 'text-[#5B4BFF]' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={`relative z-10 w-[72px] text-center py-1 text-xs font-extrabold transition-colors ${
                  !isLogin ? 'text-[#5B4BFF]' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Register
              </Link>
            </div>
          </div>

          {/* Form Outlet */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>

        </div>

        {/* Floating Chips Under Card: Instant Delivery & Live Members */}
        <div className="mt-4 flex items-center justify-center gap-3 text-xs font-bold text-slate-600">
          <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-full px-3.5 py-1.5 shadow-xs">
            <HiLightningBolt className="w-3.5 h-3.5 text-[#5B4BFF]" />
            <span className="text-slate-700 font-semibold text-[11px]">Instant Delivery</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-full px-3.5 py-1.5 shadow-xs">
            <HiSparkles className="w-3.5 h-3.5 text-[#5B4BFF]" />
            <span className="text-slate-700 font-semibold text-[11px]">
              <CountUp to={rawUserCount} duration={2} suffix="+" /> Members
            </span>
          </div>
        </div>

      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-3 text-center text-[11px] text-slate-400 font-medium">
        © {new Date().getFullYear()} StreamKart Inc. All rights reserved.
      </footer>

      <ScrollRestoration />
    </div>
  );
};

export default AuthLayout;
