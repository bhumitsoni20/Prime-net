import { useOutlet, Link, useLocation, ScrollRestoration } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getPublicStats } from '../../services/public.service';
import { FaDiscord, FaFigma, FaTwitch, FaSpotify } from 'react-icons/fa';const AuthLayout = () => {
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
            <img src="/streamkart-logo.png" alt="StreamKart" className="h-14 w-auto object-contain drop-shadow-md" />
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
              {/* Discord */}
              <div className="absolute top-0 left-0 h-14 w-14 rounded-[14px] glass-dark flex items-center justify-center animate-float shadow-lg">
                <FaDiscord className="w-8 h-8 text-[#5865F2]" />
              </div>
              {/* Figma */}
              <div className="absolute top-4 left-28 h-12 w-12 rounded-[14px] glass-dark flex items-center justify-center animate-float-delayed shadow-lg">
                <FaFigma className="w-7 h-7 text-[#F24E1E]" />
              </div>
              {/* Spotify */}
              <div className="absolute top-12 right-20 h-14 w-14 rounded-[14px] glass-dark flex items-center justify-center animate-float-slow shadow-lg">
                <FaSpotify className="w-9 h-9 text-[#1DB954]" />
              </div>
              {/* Center icon / Play */}
              <div className="absolute top-28 left-16 h-16 w-16 rounded-[16px] bg-gradient-to-br from-[#5B4BFF] to-[#7C3AED] flex items-center justify-center animate-float shadow-[0_8px_24px_rgba(91,75,255,0.35)]">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </div>
              {/* Claude */}
              <div className="absolute top-20 right-8 h-12 w-12 rounded-[14px] bg-[#D97757] flex items-center justify-center animate-float-delayed shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-[#FDFBF9]" viewBox="0 0 16 16">
                  <path d="m3.127 10.604 3.135-1.76.053-.153-.053-.085H6.11l-.525-.032-1.791-.048-1.554-.065-1.505-.08-.38-.081L0 7.832l.036-.234.32-.214.455.04 1.009.069 1.513.105 1.097.064 1.626.17h.259l.036-.105-.089-.065-.068-.064-1.566-1.062-1.695-1.121-.887-.646-.48-.327-.243-.306-.104-.67.435-.48.585.04.15.04.593.456 1.267.981 1.654 1.218.242.202.097-.068.012-.049-.109-.181-.9-1.626-.96-1.655-.428-.686-.113-.411a2 2 0 0 1-.068-.484l.496-.674L4.446 0l.662.089.279.242.411.94.666 1.48 1.033 2.014.302.597.162.553.06.17h.105v-.097l.085-1.134.157-1.392.154-1.792.052-.504.25-.605.497-.327.387.186.319.456-.045.294-.19 1.23-.37 1.93-.243 1.29h.142l.161-.16.654-.868 1.097-1.372.484-.545.565-.601.363-.287h.686l.505.751-.226.775-.707.895-.585.759-.839 1.13-.524.904.048.072.125-.012 1.897-.403 1.024-.186 1.223-.21.553.258.06.263-.218.536-1.307.323-1.533.307-2.284.54-.028.02.032.04 1.029.098.44.024h1.077l2.005.15.525.346.315.424-.053.323-.807.411-3.631-.863-.872-.218h-.12v.073l.726.71 1.331 1.202 1.667 1.55.084.383-.214.302-.226-.032-1.464-1.101-.565-.497-1.28-1.077h-.084v.113l.295.432 1.557 2.34.08.718-.112.234-.404.141-.444-.08-.911-1.28-.94-1.44-.759-1.291-.093.053-.448 4.821-.21.246-.484.186-.403-.307-.214-.496.214-.98.258-1.28.21-1.016.19-1.263.112-.42-.008-.028-.092.012-.953 1.307-1.448 1.957-1.146 1.227-.274.109-.477-.247.045-.44.266-.39 1.586-2.018.956-1.25.617-.723-.004-.105h-.036l-4.212 2.736-.75.096-.324-.302.04-.496.154-.162 1.267-.871z"/>
                </svg>
              </div>
              {/* Twitch */}
              <div className="absolute bottom-4 left-32 h-14 w-14 rounded-[14px] glass-dark flex items-center justify-center animate-float-slow shadow-lg">
                <FaTwitch className="w-8 h-8 text-[#9146FF]" />
              </div>
              {/* Notion */}
              <div className="absolute bottom-0 right-32 h-12 w-12 rounded-[14px] bg-white border border-[#E2E8F0] flex items-center justify-center animate-float shadow-lg">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" className="w-6 h-6 object-contain" />
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
