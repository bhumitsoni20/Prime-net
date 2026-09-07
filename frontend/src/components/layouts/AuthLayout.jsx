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
  HiShieldCheck,
  HiLightningBolt,
  HiLockClosed,
  HiSparkles,
  HiArrowLeft,
  HiCheckCircle,
} from 'react-icons/hi';
import { BorderBeam, ShinyText, CountUp } from '../reactbits';

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
    <div className="h-screen max-h-screen overflow-hidden bg-[#F8FAFC] text-slate-900 flex flex-col justify-between relative select-none">
      
      {/* Modern Tech Grid Lattice & Ambient Pastel Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(91,75,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(91,75,255,0.035)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_40%,#000_50%,transparent_100%)]" />
        
        {/* Ambient Pastel Gradient Orbs */}
        <div className="absolute -top-32 left-1/4 w-[600px] h-[450px] rounded-full bg-gradient-to-tr from-[#5B4BFF]/12 to-[#7C3AED]/12 blur-[150px]" />
        <div className="absolute -bottom-32 right-1/4 w-[500px] h-[400px] rounded-full bg-gradient-to-tl from-[#38BDF8]/12 to-[#A855F7]/12 blur-[140px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-2.5 sm:py-3 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-95 transition-opacity">
          <img
            src="/streamkart-logo-nav.png"
            alt="StreamKart"
            className="h-12 sm:h-14 md:h-16 w-auto max-w-[220px] sm:max-w-[260px] object-contain drop-shadow-sm"
          />
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white border border-slate-200/90 text-xs font-bold text-slate-600 hover:text-slate-900 transition-all backdrop-blur-md shadow-xs"
        >
          <HiArrowLeft className="w-3.5 h-3.5 text-[#5B4BFF]" />
          <span>Back to marketplace</span>
        </Link>
      </header>

      {/* Center Floating Light Bento Card */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 my-auto">
        <div className="relative rounded-[28px] bg-white border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(91,75,255,0.12),0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Animated Border Beam */}
          <BorderBeam
            size={320}
            duration={10}
            borderWidth={1.5}
            colorFrom="#5B4BFF"
            colorTo="#7C3AED"
          />

          {/* Left Column — Showcase Panel (5 cols) in Clean Light Style */}
          <div className="lg:col-span-5 p-6 sm:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 relative overflow-hidden bg-gradient-to-br from-[#FAF5FF]/70 via-[#F8FAFC] to-[#EFF6FF]/60">
            
            {/* Ambient inner soft glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#5B4BFF]/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white text-[#5B4BFF] border border-[#5B4BFF]/20 rounded-full px-3 py-1 text-[11px] font-bold mb-3 shadow-xs">
                <HiSparkles className="w-3.5 h-3.5 text-[#5B4BFF]" />
                <span>Next-Gen Marketplace</span>
              </div>

              {/* Headline */}
              <h1 className="text-[24px] sm:text-[28px] font-black text-[#0F172A] leading-[1.15] tracking-[-0.03em] mb-2">
                All your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED]">subscriptions.</span>
                <br />
                One seamless place.
              </h1>

              <p className="text-slate-500 text-xs leading-relaxed mb-4">
                Access verified digital passes, licenses, and premium accounts with automated 1-click delivery.
              </p>

              {/* Value Props */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-[#5B4BFF]/10 text-[#5B4BFF] flex items-center justify-center flex-shrink-0">
                    <HiLightningBolt className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 text-xs font-bold">Instant 1-Click Delivery</h4>
                    <p className="text-slate-500 text-[11px] leading-normal">Automated credentials delivered to your wallet in seconds.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <HiShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 text-xs font-bold">Escrow Buyer Protection</h4>
                    <p className="text-slate-500 text-[11px] leading-normal">Funds held safely until you verify full access to your pass.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <HiLockClosed className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 text-xs font-bold">Encrypted Pass Vault</h4>
                    <p className="text-slate-500 text-[11px] leading-normal">End-to-end encryption keeps your digital assets safe.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Live Metrics */}
            <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-600">
              <div className="flex items-center gap-1.5">
                <HiCheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Verified Escrow</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#5B4BFF]">
                <HiSparkles className="w-4 h-4 text-[#5B4BFF]" />
                <CountUp to={rawUserCount} duration={2} suffix="+" /> Members
              </div>
            </div>

          </div>

          {/* Right Column — Auth Form Card (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-7 flex flex-col justify-between">
            
            {/* Top Switcher inside card */}
            <div className="flex items-center justify-between pb-3 mb-1 border-b border-slate-100">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Account Access
              </span>

              {/* Quick Tab Switcher */}
              <div className="relative flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/80">
                <div
                  className={`absolute top-1 bottom-1 w-[80px] bg-white rounded-full shadow-xs transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    isLogin ? 'translate-x-0' : 'translate-x-[80px]'
                  }`}
                />
                <Link
                  to="/login"
                  className={`relative z-10 w-[80px] text-center py-1 text-xs font-extrabold transition-colors ${
                    isLogin ? 'text-[#5B4BFF]' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className={`relative z-10 w-[80px] text-center py-1 text-xs font-extrabold transition-colors ${
                    !isLogin ? 'text-[#5B4BFF]' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Register
                </Link>
              </div>
            </div>

            {/* Form Outlet */}
            <div className="py-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {outlet}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Trust Footer */}
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-center text-slate-400 text-[11px] font-medium">
              <HiLockClosed className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-bit SSL encrypted connection • StreamKart Shield</span>
            </div>

          </div>

        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-2 text-center text-[11px] text-slate-400 font-medium">
        © {new Date().getFullYear()} StreamKart Inc. All rights reserved. Safe escrow & instant digital activations.
      </footer>

      <ScrollRestoration />
    </div>
  );
};

export default AuthLayout;
