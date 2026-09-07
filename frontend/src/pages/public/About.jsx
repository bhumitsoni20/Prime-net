import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FiCheckCircle,
  FiShield,
  FiMessageSquare,
  FiPackage,
  FiLayers,
  FiTruck,
  FiCreditCard,
  FiStar,
  FiUsers,
  FiActivity,
  FiTrendingUp,
  FiShoppingBag,
  FiArrowRight,
  FiLock,
  FiZap,
  FiGlobe,
} from 'react-icons/fi';
import {
  HiShieldCheck,
  HiSparkles,
  HiLightningBolt,
  HiBadgeCheck,
  HiArrowSmRight,
} from 'react-icons/hi';
import { getPublicStats } from '../../services/public.service';
import {
  AuroraBackground,
  BorderBeam,
  ShinyText,
  SpotlightCard,
  CountUp,
} from '../../components/reactbits';

// Scroll Reveal Variant
const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

// Reusable Section Wrapper
const AnimatedSection = ({ children, className = '' }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const About = () => {
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
  const rawProductCount = stats?.totalProducts !== undefined ? stats.totalProducts : 120;

  useEffect(() => {
    document.title = 'About StreamKart — Next-Gen Digital Commerce Marketplace';
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#EDE9FE] selection:text-[#5B4BFF] overflow-hidden">
      
      {/* ─── HERO SECTION ────────────────────────────────────────── */}
      <AuroraBackground className="pt-10 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 max-w-2xl">
              
              {/* Live Status Pill */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-xl text-[#5B4BFF] border border-[#5B4BFF]/20 rounded-full px-4 py-1.5 text-xs sm:text-[13px] font-bold mb-6 shadow-xs"
              >
                <HiSparkles className="w-4 h-4 text-[#7C3AED]" />
                <span>Next-Generation Digital Marketplace</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="text-[40px] sm:text-[54px] lg:text-[62px] font-black tracking-[-0.035em] text-[#0F172A] leading-[1.08] mb-6"
              >
                Building a Trusted Marketplace for{' '}
                <ShinyText text="Digital Commerce" speed={3.5} className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED]" />
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2 }}
                className="text-slate-600 text-base sm:text-lg lg:text-[19px] leading-relaxed mb-8 max-w-xl font-medium"
              >
                StreamKart is an advanced customer-to-customer (C2C) digital ecosystem that bridges verified sellers and buyers through automated 1-click fulfillment, escrow security, and transparent peer reviews.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4"
              >
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED] hover:from-[#4F3FE8] hover:to-[#6D28D9] text-white rounded-2xl font-extrabold text-sm shadow-[0_8px_24px_rgba(91,75,255,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <span>Explore Marketplace</span>
                  <FiArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/seller/register"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/90 hover:bg-white text-slate-800 border border-slate-200/90 rounded-2xl font-bold text-sm shadow-xs hover:border-[#5B4BFF]/40 hover:text-[#5B4BFF] hover:-translate-y-0.5 transition-all cursor-pointer backdrop-blur-md"
                >
                  <span>Become a Verified Seller</span>
                  <HiBadgeCheck className="w-4 h-4 text-emerald-500" />
                </Link>
              </motion.div>

              {/* Quick Trust Highlights */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap items-center gap-6 mt-10 pt-6 border-t border-slate-200/60 text-xs font-bold text-slate-500"
              >
                <span className="flex items-center gap-1.5">
                  <HiShieldCheck className="w-4 h-4 text-emerald-500" />
                  100% Escrow Protected
                </span>
                <span className="flex items-center gap-1.5">
                  <HiLightningBolt className="w-4 h-4 text-amber-500" />
                  Automated Delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <FiLock className="w-3.5 h-3.5 text-[#5B4BFF]" />
                  256-Bit SSL Encrypted
                </span>
              </motion.div>

            </div>

            {/* Right Interactive 3D Marketplace Hub Visual */}
            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative w-full h-[440px] sm:h-[480px] rounded-[32px] bg-gradient-to-br from-white/90 via-white/70 to-indigo-50/40 backdrop-blur-2xl border border-white/80 shadow-[0_25px_60px_-15px_rgba(91,75,255,0.18)] p-6 sm:p-8 flex items-center justify-center overflow-hidden"
              >
                {/* Border Beam */}
                <BorderBeam size={280} duration={12} borderWidth={1.5} colorFrom="#5B4BFF" colorTo="#38BDF8" />

                {/* Animated Background Flow Grid & Wave Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
                  <motion.path
                    d="M 15% 50% Q 50% 15% 85% 50%"
                    fill="transparent"
                    stroke="url(#hero-flow-grad)"
                    strokeWidth="2.5"
                    strokeDasharray="6,6"
                    animate={{ strokeDashoffset: -24 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.path
                    d="M 15% 50% Q 50% 85% 85% 50%"
                    fill="transparent"
                    stroke="url(#hero-flow-grad)"
                    strokeWidth="2.5"
                    strokeDasharray="6,6"
                    animate={{ strokeDashoffset: 24 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  />
                  <defs>
                    <linearGradient id="hero-flow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#5B4BFF" stopOpacity="0.2" />
                      <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Central Escrow Hub Engine */}
                <motion.div
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-20 bg-white rounded-[26px] p-6 shadow-[0_20px_45px_rgba(91,75,255,0.16)] border border-slate-100 flex flex-col items-center text-center w-56 sm:w-60"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#5B4BFF] to-[#7C3AED] flex items-center justify-center text-white shadow-[0_10px_25px_rgba(91,75,255,0.35)] mb-3">
                    <FiShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="text-slate-900 font-black text-sm tracking-tight">StreamKart Core</h4>
                  <p className="text-[11px] font-bold text-slate-400 mb-3">Automated Escrow Protocol</p>
                  
                  <div className="w-full bg-slate-50 border border-slate-100 rounded-xl py-1.5 px-3 flex items-center justify-between text-[10px] font-extrabold text-emerald-600">
                    <span className="flex items-center gap-1">
                      <HiShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Safe Escrow
                    </span>
                    <span className="text-slate-400">⚡ Live</span>
                  </div>
                </motion.div>

                {/* Orbiting Satellite 1: Verified Seller Node */}
                <motion.div
                  animate={{ y: [-12, 12, -12], rotate: [-4, 4, -4] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  className="absolute top-8 left-6 z-20 bg-white rounded-2xl p-3.5 shadow-lg border border-slate-100 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-slate-900">Verified Seller</div>
                    <div className="text-[10px] text-slate-400 font-semibold">100% Identity Verified</div>
                  </div>
                </motion.div>

                {/* Orbiting Satellite 2: Instant Delivery Node */}
                <motion.div
                  animate={{ y: [10, -10, 10], rotate: [3, -3, 3] }}
                  transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  className="absolute bottom-8 right-6 z-20 bg-white rounded-2xl p-3.5 shadow-lg border border-slate-100 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#5B4BFF]/10 text-[#5B4BFF] flex items-center justify-center">
                    <FiZap className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-slate-900">Instant Access</div>
                    <div className="text-[10px] text-slate-400 font-semibold">&lt; 60s Pass Delivery</div>
                  </div>
                </motion.div>

                {/* Orbiting Satellite 3: Buyer Protection Node */}
                <motion.div
                  animate={{ y: [-10, 10, -10], rotate: [-3, 3, -3] }}
                  transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
                  className="absolute top-10 right-6 z-20 bg-white rounded-2xl p-3 shadow-lg border border-slate-100 flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <FiUsers className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-extrabold text-slate-900">Protected Buyer</div>
                    <div className="text-[9px] text-slate-400 font-medium">Dispute Guarantee</div>
                  </div>
                </motion.div>

                {/* Orbiting Satellite 4: 256-Bit Encryption Node */}
                <motion.div
                  animate={{ y: [8, -8, 8], rotate: [4, -4, 4] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
                  className="absolute bottom-10 left-8 z-20 bg-white rounded-2xl p-3 shadow-lg border border-slate-100 flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FiShield className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-extrabold text-slate-900">Encrypted Vault</div>
                    <div className="text-[9px] text-slate-400 font-medium">Secure Key Storage</div>
                  </div>
                </motion.div>

              </motion.div>
            </div>

          </div>
        </div>
      </AuroraBackground>

      {/* ─── LIVE PLATFORM METRICS BAR ───────────────────────────── */}
      <section className="relative z-20 -mt-8 max-w-6xl mx-auto px-4 sm:px-6">
        <AnimatedSection className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_20px_50px_-10px_rgba(91,75,255,0.12)] p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="border-r border-slate-100 last:border-0">
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              <CountUp to={rawUserCount} duration={2} suffix="+" />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
              Active Community
            </div>
          </div>

          <div className="border-r border-slate-100 last:border-0">
            <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED] tracking-tight">
              100%
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
              Escrow Protection
            </div>
          </div>

          <div className="border-r border-slate-100 last:border-0">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
              &lt; 60s
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
              Avg. Activation Time
            </div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              24/7
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
              Dispute Resolution
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ─── WHO WE ARE & MISSION (BENTO ARCHITECTURE) ────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-[#5B4BFF]/10 text-[#5B4BFF] rounded-full px-3.5 py-1.5 text-xs font-bold mb-3">
            <HiSparkles className="w-3.5 h-3.5" />
            <span>The StreamKart Philosophy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight mb-4">
            Reinventing Digital Commerce for the Modern Creator & Consumer
          </h2>
          <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
            We are replacing fragmented forums and risky peer-to-peer exchanges with a verified, automated marketplace platform.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Bento Card 1: Who We Are */}
          <AnimatedSection>
            <SpotlightCard
              spotlightColor="rgba(91, 75, 255, 0.12)"
              className="h-full p-8 sm:p-10 rounded-[28px] bg-white border border-slate-200/80 shadow-[0_12px_36px_rgba(0,0,0,0.03)] relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#5B4BFF]/10 text-[#5B4BFF] flex items-center justify-center mb-6 shadow-xs">
                <FiGlobe className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-[#0F172A] tracking-tight mb-4">Who We Are</h3>
              <p className="text-slate-600 text-base leading-relaxed mb-4">
                StreamKart is a specialized customer-to-customer (C2C) digital marketplace. We connect verified merchants and developers with digital consumers looking for subscriptions, licenses, and verified passes.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">
                Rather than acting as a reseller, StreamKart provides the mission-critical infrastructure: automated wallet disbursements, identity verification rails, end-to-end encrypted order messaging, and 100% escrow protection.
              </p>
            </SpotlightCard>
          </AnimatedSection>

          {/* Bento Card 2: Our Mission */}
          <AnimatedSection>
            <SpotlightCard
              spotlightColor="rgba(124, 58, 237, 0.12)"
              className="h-full p-8 sm:p-10 rounded-[28px] bg-gradient-to-br from-[#FAF5FF]/70 via-white to-[#F0FDF4]/40 border border-slate-200/80 shadow-[0_12px_36px_rgba(0,0,0,0.03)] relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 shadow-xs">
                <FiTrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-[#0F172A] tracking-tight mb-4">Our Mission</h3>
              <p className="text-slate-600 text-base leading-relaxed mb-4">
                Our mission is to establish the world’s most trusted standard for digital asset transfers, eliminating scam risks and complicated manual setups.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">
                We empower independent digital merchants with enterprise-grade selling tools while giving buyers total peace of mind through guaranteed escrow custody and rapid activation.
              </p>
            </SpotlightCard>
          </AnimatedSection>

        </div>
      </section>

      {/* ─── WHAT WE OFFER (8 PILLARS) ────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] border-y border-slate-200/70 relative">
        <div className="max-w-7xl mx-auto">
          
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 rounded-full px-3.5 py-1.5 text-xs font-bold mb-3">
              <HiShieldCheck className="w-3.5 h-3.5" />
              <span>Full-Stack Ecosystem</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight mb-4">
              Comprehensive Tools for Digital Commerce
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Every feature is built from the ground up to ensure safety, speed, and supreme user experience.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FiCheckCircle,
                color: 'text-emerald-600 bg-emerald-50',
                title: 'Verified Seller Network',
                desc: 'Strict KYC verification ensuring you only trade with tested and authentic merchants.',
              },
              {
                icon: FiShield,
                color: 'text-[#5B4BFF] bg-[#5B4BFF]/10',
                title: '100% Escrow Protection',
                desc: 'Buyer funds remain safe in escrow until pass activation is fully verified.',
              },
              {
                icon: FiMessageSquare,
                color: 'text-purple-600 bg-purple-50',
                title: 'Encrypted Live Chat',
                desc: 'Direct order communication with real-time support and instant credential transfers.',
              },
              {
                icon: FiLayers,
                color: 'text-pink-600 bg-pink-50',
                title: 'Custom Bundles',
                desc: 'Discover multi-product packages crafted by sellers with huge volume savings.',
              },
              {
                icon: FiActivity,
                color: 'text-blue-600 bg-blue-50',
                title: 'Real-Time Order Tracking',
                desc: 'Live audit log of fulfillment milestones, activation keys, and receipt invoices.',
              },
              {
                icon: FiCreditCard,
                color: 'text-amber-600 bg-amber-50',
                title: 'Automated Wallet Rails',
                desc: 'Instant wallet top-ups, seamless 1-click checkouts, and swift seller withdrawals.',
              },
              {
                icon: FiStar,
                color: 'text-yellow-600 bg-yellow-50',
                title: 'Transparent Reviews',
                desc: 'Only confirmed buyers who completed orders can leave immutable ratings.',
              },
              {
                icon: FiTruck,
                color: 'text-indigo-600 bg-indigo-50',
                title: 'Custom Product Requests',
                desc: 'Can’t find what you need? Request specific digital passes and get quotes from sellers.',
              },
            ].map((pillar, i) => (
              <AnimatedSection key={i}>
                <div className="h-full p-7 rounded-[22px] bg-white border border-slate-200/80 shadow-xs hover:shadow-[0_16px_36px_rgba(91,75,255,0.08)] hover:border-[#5B4BFF]/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className={`w-12 h-12 rounded-2xl ${pillar.color} flex items-center justify-center mb-5`}>
                      <pillar.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-black text-[#0F172A] mb-2 tracking-tight">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

        </div>
      </section>

      {/* ─── HOW STREAMKART WORKS (5 STEPS) ────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 bg-[#5B4BFF]/10 text-[#5B4BFF] rounded-full px-3.5 py-1.5 text-xs font-bold mb-3">
            <FiZap className="w-3.5 h-3.5" />
            <span>Frictionless Lifecycle</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight mb-4">
            How StreamKart Works
          </h2>
          <p className="text-slate-500 text-base leading-relaxed">
            A seamless 5-step automated workflow designed for speed, safety, and transparency.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative">
          {[
            {
              step: '01',
              title: 'Seller Lists Asset',
              desc: 'Verified sellers publish digital passes with instant automated fulfillment details.',
              icon: FiPackage,
            },
            {
              step: '02',
              title: 'Buyer Checks Out',
              desc: 'Secure payment is locked into StreamKart escrow custody. Zero immediate risk.',
              icon: FiShoppingBag,
            },
            {
              step: '03',
              title: 'Automated Delivery',
              desc: 'Credentials and activation tokens are delivered directly to your wallet in seconds.',
              icon: FiZap,
            },
            {
              step: '04',
              title: 'Buyer Verification',
              desc: 'Buyer confirms full access and verifies pass validity before escrow release.',
              icon: FiShield,
            },
            {
              step: '05',
              title: 'Settlement & Review',
              desc: 'Funds are disbursed to seller wallet and verified buyer leaves authentic feedback.',
              icon: FiStar,
            },
          ].map((step, idx) => (
            <AnimatedSection key={idx}>
              <div className="h-full p-6 rounded-[24px] bg-white border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-[#5B4BFF]/30 transition-all flex flex-col justify-between text-left group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED]">
                      {step.step}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-[#5B4BFF]/10 text-slate-400 group-hover:text-[#5B4BFF] flex items-center justify-center transition-colors">
                      <step.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-black text-[#0F172A] mb-2 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ─── TRUST & SAFETY (DARK SHOWCASE BENTO) ──────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0B0D1B] text-white relative overflow-hidden">
        
        {/* Ambient Nebula Glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#5B4BFF]/15 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#7C3AED]/15 blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-[#A855F7] border border-white/10 rounded-full px-3.5 py-1.5 text-xs font-bold mb-6">
                <HiShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Enterprise Trust Architecture</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.03em] leading-tight mb-6 text-white">
                Marketplace Integrity is Our Top Priority
              </h2>

              <p className="text-slate-300 text-base leading-relaxed mb-6 font-medium">
                StreamKart strictly enforces automated escrow holds, merchant verification, proactive fraud scoring, and immutable buyer feedback loops to maintain 100% marketplace trust.
              </p>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-slate-400 leading-relaxed mb-8">
                <span className="font-bold text-white">Platform Responsibility:</span> Individual sellers remain responsible for the digital items listed and must comply with StreamKart’s acceptable use policy and terms of service.
              </div>

              <div className="flex flex-wrap gap-3">
                {['Verified Sellers Only', 'Zero Chargeback Scams', '24/7 Dispute Mediation', 'Immutable Reviews', 'Automated Escrow'].map((badge, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-bold text-slate-200">
                    <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Trust Feature Grid */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Escrow Vault', desc: 'Payments are never released until the buyer confirms working credentials.', icon: FiLock },
                { title: 'Seller KYC', desc: 'Merchants submit identity verification before publishing marketplace listings.', icon: FiShield },
                { title: 'Encrypted Chat', desc: 'Secure in-app communication channels prevent external phishing and scams.', icon: FiMessageSquare },
                { title: 'Instant Support', desc: 'Direct access to admin dispute operators for fast resolution.', icon: FiZap },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                  <div className="w-10 h-10 rounded-xl bg-[#5B4BFF]/20 text-[#7B6FFF] flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-white mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ─── CALL TO ACTION SECTION ───────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
        <AnimatedSection className="max-w-5xl mx-auto rounded-[32px] bg-white border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(91,75,255,0.14)] p-8 sm:p-14 text-center relative overflow-hidden">
          
          <BorderBeam size={300} duration={12} borderWidth={1.5} colorFrom="#5B4BFF" colorTo="#7C3AED" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#5B4BFF]/10 text-[#5B4BFF] rounded-full px-3.5 py-1.5 text-xs font-bold mb-4">
              <HiSparkles className="w-3.5 h-3.5" />
              <span>Get Started Today</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight mb-4">
              Join the Future of Digital Commerce
            </h2>

            <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              Whether you’re looking to explore instant digital passes or scale as a verified merchant, StreamKart provides the ultimate trusted platform.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED] hover:from-[#4F3FE8] hover:to-[#6D28D9] text-white rounded-2xl font-extrabold text-sm shadow-[0_8px_24px_rgba(91,75,255,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Explore Marketplace</span>
                <FiArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/seller/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-slate-800 border border-slate-200/90 rounded-2xl font-bold text-sm shadow-xs hover:border-[#5B4BFF]/40 hover:text-[#5B4BFF] hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Become a Seller</span>
                <HiBadgeCheck className="w-4 h-4 text-emerald-500" />
              </Link>
            </div>

            <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <span>Need help? Contact our support team directly:</span>
              <a
                href="mailto:support@streamkart.in"
                className="inline-flex items-center gap-1.5 font-bold text-[#5B4BFF] hover:underline"
              >
                <FiMessageSquare className="w-3.5 h-3.5" />
                <span>support@streamkart.in</span>
              </a>
            </div>
          </div>

        </AnimatedSection>
      </section>

    </div>
  );
};

export default About;
