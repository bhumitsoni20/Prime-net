import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { 
  FiCheckCircle, FiShield, FiMessageSquare, FiPackage, 
  FiLayers, FiTruck, FiCreditCard, FiStar, FiUsers, 
  FiActivity, FiTrendingUp, FiShoppingBag, FiArrowRight
} from 'react-icons/fi';

// Scroll Reveal Variant
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// Reusable Section Wrapper
const AnimatedSection = ({ children, className }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div ref={ref} initial="hidden" animate={controls} variants={fadeInUp} className={className}>
      {children}
    </motion.div>
  );
};



const About = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-6 lg:px-8 overflow-hidden bg-[#FAFAFA]">
        {/* Subtle Ambient Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/40 blur-[120px] pointer-events-none mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-200/40 blur-[120px] pointer-events-none mix-blend-multiply" />
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-widest">Trusted Marketplace</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Building a Trusted Marketplace for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Digital Commerce</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg">
              StreamKart is a customer-to-customer (C2C) digital marketplace that connects verified sellers with buyers through a secure, transparent, and easy-to-use platform for eligible digital products and services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link to="/products" className="inline-flex justify-center items-center px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 hover:-translate-y-1 transition-all shadow-[0_8px_20px_rgba(79,70,229,0.25)]">
                Explore Marketplace
              </Link>
              <Link to="/seller/register" className="inline-flex justify-center items-center px-8 py-4 bg-white text-indigo-600 border border-indigo-200 rounded-xl font-semibold hover:bg-indigo-50 hover:-translate-y-1 transition-all">
                Become a Seller
              </Link>
            </div>
          </motion.div>

          {/* Animated Marketplace Illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative h-[400px] lg:h-[500px] w-full rounded-2xl bg-white/50 backdrop-blur-xl border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.04)] flex items-center justify-center p-8 overflow-hidden group"
          >
            {/* Animated Flow Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <motion.path 
                d="M 20% 50% Q 50% 20% 80% 50%" 
                fill="transparent" 
                stroke="url(#gradient)" 
                strokeWidth="2" 
                strokeDasharray="5,5"
                animate={{ strokeDashoffset: -20 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.path 
                d="M 20% 50% Q 50% 80% 80% 50%" 
                fill="transparent" 
                stroke="url(#gradient)" 
                strokeWidth="2" 
                strokeDasharray="5,5"
                animate={{ strokeDashoffset: 20 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#4f46e5" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>

            <div className="flex justify-between items-center w-full max-w-sm relative z-10">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100">
                  <FiCheckCircle className="w-8 h-8 text-indigo-600" />
                </div>
                <span className="text-xs font-semibold text-slate-600">Verified Seller</span>
              </motion.div>
              
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 bg-indigo-600 rounded-2xl shadow-[0_10px_30px_rgba(79,70,229,0.3)] flex items-center justify-center">
                  <FiShoppingBag className="w-10 h-10 text-white" />
                </div>
                <span className="text-xs font-semibold text-indigo-700">Marketplace</span>
              </motion.div>

              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100">
                  <FiUsers className="w-8 h-8 text-indigo-600" />
                </div>
                <span className="text-xs font-semibold text-slate-600">Buyer</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* WHO WE ARE & MISSION */}
      <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16">
          <AnimatedSection className="bg-white p-10 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">Who We Are</h2>
            <p className="text-slate-600 leading-relaxed text-lg mb-4">
              StreamKart is a customer-to-customer (C2C) digital marketplace built to simplify digital commerce. Our platform enables verified sellers to list eligible digital products and services while providing buyers with a secure environment to discover, purchase, and manage their digital orders.
            </p>
            <p className="text-slate-600 leading-relaxed text-lg">
              Rather than acting as the seller of listed products, StreamKart provides the technology, marketplace infrastructure, secure communication, order management, and support systems that connect buyers and sellers. Our mission is to make digital commerce safer, more transparent, and easier for everyone.
            </p>
          </AnimatedSection>
          
          <AnimatedSection className="bg-slate-50 p-10 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-300 to-slate-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed text-lg mb-4">
              Our mission is to build a trusted marketplace where digital commerce becomes simple, transparent, and secure. 
            </p>
            <p className="text-slate-600 leading-relaxed text-lg">
              We aim to empower independent sellers with professional tools while giving buyers confidence through verification, secure communication, structured order management, and reliable customer support.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* WHAT WE OFFER */}
      <section className="py-24 px-6 lg:px-8 bg-[#FAFAFA] border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">What We Offer</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Comprehensive tools designed to facilitate smooth and secure digital transactions.</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FiCheckCircle, title: "Verified Seller Marketplace", desc: "Only verified sellers can access marketplace selling features." },
              { icon: FiMessageSquare, title: "Secure Communication", desc: "Real-time messaging for order-related communication." },
              { icon: FiPackage, title: "Digital Product Listings", desc: "A structured marketplace for eligible digital products and services." },
              { icon: FiLayers, title: "Bundle Listings", desc: "Sellers can create bundled offerings containing multiple products." },
              { icon: FiActivity, title: "Secure Order Management", desc: "Track every purchase from payment to delivery securely." },
              { icon: FiShield, title: "Protected Delivery", desc: "Secure delivery workflow designed for digital purchases." },
              { icon: FiCreditCard, title: "Wallet & Earnings", desc: "Seller wallet with transparent earnings and withdrawal management." },
              { icon: FiStar, title: "Reviews & Reputation", desc: "Verified buyers can rate products and sellers to maintain quality." },
            ].map((feature, i) => (
              <AnimatedSection key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-6 text-indigo-600">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* HOW STREAMKART WORKS (Timeline) */}
      <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <AnimatedSection className="text-center mb-20">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">How StreamKart Works</h2>
          <p className="text-xl text-slate-600">A frictionless five-step process for buyers and sellers.</p>
        </AnimatedSection>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-slate-100">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-indigo-500"
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              viewport={{ once: true }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-6">
            {[
              { icon: FiPackage, step: "Step 1", title: "Seller Creates Listing" },
              { icon: FiShoppingBag, step: "Step 2", title: "Buyer Places an Order" },
              { icon: FiMessageSquare, step: "Step 3", title: "Secure Communication" },
              { icon: FiTruck, step: "Step 4", title: "Digital Delivery" },
              { icon: FiStar, step: "Step 5", title: "Buyer Reviews Experience" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <AnimatedSection key={i} className="relative flex flex-col items-center text-center z-10 group">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-50 shadow-xl flex items-center justify-center mb-6 text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-50 transition-all duration-300 relative">
                    <Icon className="w-8 h-8" />
                    {/* Active dot indicator for timeline */}
                    <div className="hidden lg:block absolute -top-14 w-4 h-4 rounded-full bg-white border-[3px] border-indigo-500 shadow-[0_0_0_4px_white]" />
                  </div>
                  <div className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">{item.step}</div>
                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE STREAMKART & TRUST */}
      <section className="py-24 px-6 lg:px-8 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center z-10 relative">
          <AnimatedSection>
            <h2 className="text-4xl font-bold tracking-tight mb-6 text-white">Trust & Safety</h2>
            <p className="text-lg text-slate-300 leading-relaxed mb-6">
              Building trust is at the core of StreamKart. Our platform continuously improves marketplace integrity through seller verification, secure authentication, protected communication, dispute handling, fraud prevention measures, and transparent review systems.
            </p>
            <p className="text-lg text-slate-300 leading-relaxed mb-10">
              We are committed to creating a safer marketplace experience for both buyers and sellers.
            </p>
            
            <h2 className="text-4xl font-bold tracking-tight mb-6 text-white">Our Role</h2>
            <p className="text-lg text-slate-300 leading-relaxed mb-6">
              StreamKart operates as a technology marketplace platform. We provide marketplace infrastructure, seller onboarding, secure messaging, order management, marketplace moderation, dispute support, and platform security.
            </p>
            <p className="text-sm text-slate-400 p-4 bg-white/5 border border-white/10 rounded-xl">
              * Individual sellers remain responsible for the products and services they list and must comply with our marketplace policies and applicable laws.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 gap-4">
            {[
              "Verified Sellers", "Secure Marketplace", "Transparent Reviews", 
              "Real-Time Comms", "Order Tracking", "Modern Experience", 
              "Dedicated Support", "Continuous Updates"
            ].map((reason, i) => (
              <AnimatedSection key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors flex items-center gap-4">
                <FiCheckCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                <span className="font-semibold text-slate-100">{reason}</span>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>



      {/* FOOTER CTA & CONTACT */}
      <section className="py-24 px-6 lg:px-8 bg-[#FAFAFA] text-center">
        <AnimatedSection className="max-w-4xl mx-auto bg-white p-12 md:p-16 rounded-[2rem] border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.03)]">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Join the Future of Digital Commerce</h2>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Whether you're looking to discover digital products or grow as a verified seller, StreamKart provides a secure marketplace built for modern digital commerce.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link to="/products" className="inline-flex justify-center items-center px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-[0_8px_20px_rgba(79,70,229,0.25)]">
              Explore Marketplace
            </Link>
            <Link to="/seller/register" className="inline-flex justify-center items-center px-8 py-4 bg-white text-indigo-600 border border-slate-200 rounded-xl font-semibold hover:border-indigo-200 hover:bg-indigo-50 transition-all">
              Become a Seller
            </Link>
          </div>

          <div className="pt-10 border-t border-slate-100 flex flex-col items-center">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Need Assistance?</h3>
            <p className="text-slate-600 mb-6">Our support team is always ready to help.</p>
            <a href="mailto:support@streamkart.in" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 hover:bg-indigo-50 px-6 py-3 rounded-xl transition-colors">
              <FiMessageSquare /> Contact Support
            </a>
          </div>
        </AnimatedSection>
      </section>

    </div>
  );
};

export default About;
