import { useOutlet, Link, useLocation, ScrollRestoration } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getPublicStats } from '../../services/public.service';
import { FiShield, FiLock, FiCheckCircle, FiMessageSquare, FiShoppingBag, FiPackage, FiZap } from 'react-icons/fi';
const AuthLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const isLogin = location.pathname === '/login' || location.pathname === '/phone-login' || location.pathname === '/forgot-password';

  const { data: stats } = useQuery({
    queryKey: ['publicStats'],
    queryFn: async () => {
      const response = await getPublicStats();
      return response.data;
    },
  });

  const userCountText = stats?.totalUsers !== undefined
    ? `${stats.totalUsers.toLocaleString()}+` 
    : '10K+';

  return (
    <div className="min-h-screen flex">
      {/* Left — Dark branded panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-[#0F0F1A] via-[#1A1040] to-[#0F0F1A]">
        {/* Gradient orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#5B4BFF]/10 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[#7C3AED]/10 blur-[100px]" />
        </div>

        {/* Orbital rings */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-white/[0.04]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-[#5B4BFF]/[0.08]" />
        </div>

        <div className="relative z-10 flex flex-col h-full w-full p-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <img src="/streamkart-logo-nav.png" alt="StreamKart" className="h-28 w-auto object-contain drop-shadow-md" />
          </Link>

          {/* Headline */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <h1 className="text-[38px] font-bold text-white leading-[1.15] mb-4 tracking-[-0.02em]">
              All your <span className="bg-gradient-to-r from-[#8B5CF6] to-[#5B4BFF] bg-clip-text text-transparent">subscriptions.</span><br />
              One seamless place.
            </h1>
            <p className="text-[#64748B] text-[15px] mb-10 leading-relaxed">
              Discover, manage and pay for the best digital products and services.
            </p>

            {/* Floating brand icons */}
            <div className="relative h-56 mb-8">
              {/* Shield */}
              <div className="absolute top-0 left-0 h-14 w-14 rounded-[14px] glass-dark flex items-center justify-center animate-float shadow-lg">
                <FiShield className="w-7 h-7 text-[#10B981]" />
              </div>
              {/* Badge */}
              <div className="absolute top-4 left-28 h-12 w-12 rounded-[14px] glass-dark flex items-center justify-center animate-float-delayed shadow-lg">
                <FiCheckCircle className="w-6 h-6 text-[#3B82F6]" />
              </div>
              {/* Message */}
              <div className="absolute top-12 right-20 h-14 w-14 rounded-[14px] glass-dark flex items-center justify-center animate-float-slow shadow-lg">
                <FiMessageSquare className="w-7 h-7 text-[#F59E0B]" />
              </div>
              {/* Center Lock */}
              <div className="absolute top-28 left-16 h-16 w-16 rounded-[16px] bg-gradient-to-br from-[#5B4BFF] to-[#7C3AED] flex items-center justify-center animate-float shadow-[0_8px_24px_rgba(91,75,255,0.35)]">
                <FiLock className="w-7 h-7 text-white" />
              </div>
              {/* Bag */}
              <div className="absolute top-20 right-8 h-12 w-12 rounded-[14px] glass-dark flex items-center justify-center animate-float-delayed shadow-lg">
                <FiShoppingBag className="w-6 h-6 text-[#EC4899]" />
              </div>
              {/* Package */}
              <div className="absolute bottom-4 left-32 h-14 w-14 rounded-[14px] glass-dark flex items-center justify-center animate-float-slow shadow-lg">
                <FiPackage className="w-7 h-7 text-[#A855F7]" />
              </div>
              {/* Lightning */}
              <div className="absolute bottom-0 right-32 h-12 w-12 rounded-[14px] bg-white/5 border border-[#E2E8F0]/10 flex items-center justify-center animate-float shadow-lg backdrop-blur-md">
                <FiZap className="w-6 h-6 text-[#EAB308]" />
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-6 text-[#64748B] text-[13px] font-medium">
            <span className="flex items-center gap-1.5">✓ Secure payments</span>
            <span className="flex items-center gap-1.5">⏱ Cancel anytime</span>
            <span className="flex items-center gap-1.5">👥 {userCountText} users</span>
          </div>
        </div>
      </div>

      {/* Right — Auth form */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top bar */}
        <div className="flex justify-end p-6 h-14" />

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 pb-8 overflow-x-hidden">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                {outlet}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom login/signup toggle */}
        <div className="flex justify-center pb-8">
          <div className="relative flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-full p-1 w-56">
            {/* Sliding Pill */}
            <div 
              className={`absolute top-1 bottom-1 w-[108px] bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-[#F1F5F9] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isLogin ? 'translate-x-0' : 'translate-x-[108px]'}`}
            />
            
            <Link to="/login" className={`relative z-10 flex-1 text-center py-2.5 text-sm font-semibold transition-colors duration-300 ${isLogin ? 'text-[#0F172A]' : 'text-[#94A3B8] hover:text-[#64748B]'}`}>
              Log in
            </Link>
            <Link to="/register" className={`relative z-10 flex-1 text-center py-2.5 text-sm font-semibold transition-colors duration-300 ${!isLogin ? 'text-[#0F172A]' : 'text-[#94A3B8] hover:text-[#64748B]'}`}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <ScrollRestoration />
    </div>
  );
};

export default AuthLayout;
