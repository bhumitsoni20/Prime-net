import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { 
  FiUser, FiGlobe, FiUserPlus, FiShoppingBag, FiList, 
  FiCreditCard, FiRefreshCw, FiMessageSquare, FiShield, 
  FiAlertTriangle, FiUserX, FiInfo, FiZap, FiAnchor, 
  FiBookmark, FiArrowRight, FiMail
} from 'react-icons/fi';

const termsSections = [
  {
    id: "section-1",
    title: "1. Eligibility & Account Responsibility",
    icon: FiUser,
    content: (
      <p>Users must be 18+ and provide accurate information.</p>
    )
  },
  {
    id: "section-2",
    title: "2. Nature of the Platform",
    icon: FiGlobe,
    content: (
      <p>STREAM KART operates as a C2C digital marketplace facilitator.</p>
    )
  },
  {
    id: "section-3",
    title: "3. Seat Providers",
    icon: FiUserPlus,
    content: (
      <p>Only legally purchased unused seats may be listed.</p>
    )
  },
  {
    id: "section-4",
    title: "4. Buyers",
    icon: FiShoppingBag,
    content: (
      <p>Buyers receive temporary access only.</p>
    )
  },
  {
    id: "section-5",
    title: "5. Listing Policy",
    icon: FiList,
    content: (
      <p>Listings may be reordered or removed.</p>
    )
  },
  {
    id: "section-6",
    title: "6. Payments & Withdrawals",
    icon: FiCreditCard,
    content: (
      <>
        <p className="mb-6">Payments are made manually via UPI or bank transfer and verified through uploaded screenshots.</p>
        <h4 className="font-semibold text-slate-800 mb-4">Platform Fees:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">7 Days – 45 Days</span>
            <span className="text-4xl font-extrabold text-indigo-600">20%</span>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500 opacity-5 rounded-bl-full"></div>
            <span className="text-indigo-900 text-sm font-medium uppercase tracking-wider mb-2">3 Months</span>
            <span className="text-4xl font-extrabold text-indigo-600">25%</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">6 Months – 1 Year</span>
            <span className="text-4xl font-extrabold text-indigo-600">30%</span>
          </div>
        </div>
      </>
    )
  },
  {
    id: "section-7",
    title: "7. Refund Policy",
    icon: FiRefreshCw,
    content: (
      <>
        <p className="mb-4">Refund for non-delivery, wrong or non-working access.</p>
        <p className="mb-6">No refund for misuse, working access, or issues reported after 24 hours.</p>
        
        <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl flex items-start gap-4">
          <FiInfo className="text-indigo-600 w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-indigo-900 mb-1">Need more details?</h4>
            <p className="text-indigo-700 text-sm mb-3">Please refer to our complete Refund Policy page for comprehensive information regarding eligible refunds and dispute resolution.</p>
            <Link to="/refund" className="inline-flex items-center gap-2 text-indigo-600 font-medium text-sm hover:text-indigo-700 transition-colors">
              View Refund Policy <FiArrowRight />
            </Link>
          </div>
        </div>
      </>
    )
  },
  {
    id: "section-8",
    title: "8. Communication Rules",
    icon: FiMessageSquare,
    content: (
      <p>Use official StreamKart communication channels only.</p>
    )
  },
  {
    id: "section-9",
    title: "9. Privacy",
    icon: FiShield,
    content: (
      <>
        <p className="mb-4">User information is protected in accordance with our Privacy Policy.</p>
        <Link to="/privacy" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
          View Privacy Policy
        </Link>
      </>
    )
  },
  {
    id: "section-10",
    title: "10. Prohibited Activities",
    icon: FiAlertTriangle,
    content: (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          "Fraud",
          "Fake listings",
          "Abuse",
          "Policy violations",
          "Unauthorized activities"
        ].map((activity, idx) => (
          <div key={idx} className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <FiAlertTriangle className="text-rose-600 w-4 h-4" />
            </div>
            <span className="font-medium text-rose-900">{activity}</span>
          </div>
        ))}
      </div>
    )
  },
  {
    id: "section-11",
    title: "11. Suspension",
    icon: FiUserX,
    content: (
      <p>Accounts violating marketplace policies may be suspended or permanently terminated.</p>
    )
  },
  {
    id: "section-12",
    title: "12. Brand Disclaimer",
    icon: FiInfo,
    content: (
      <p>STREAM KART operates as an independent marketplace platform and is not affiliated with, endorsed by, sponsored by, or officially associated with any third-party brands unless explicitly stated.</p>
    )
  },
  {
    id: "section-13",
    title: "13. Platform Updates",
    icon: FiZap,
    content: (
      <>
        <p className="mb-2">STREAM KART reserves the right to modify platform features, marketplace policies, fees, and these Terms & Conditions at any time.</p>
        <p>Updated versions will be published on this page.</p>
      </>
    )
  },
  {
    id: "section-14",
    title: "14. Limitation of Liability",
    icon: FiAnchor,
    content: (
      <p>STREAM KART's liability is limited to the maximum extent permitted under applicable law.</p>
    )
  },
  {
    id: "section-15",
    title: "15. Governing Law",
    icon: FiBookmark,
    content: (
      <p>These Terms & Conditions shall be governed by and interpreted in accordance with the laws of India.</p>
    )
  }
];

// Reusable animated section card
const TermSection = ({ section, setActiveSection }) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    rootMargin: "-20% 0px -50% 0px"
  });

  useEffect(() => {
    if (inView) {
      setActiveSection(section.id);
    }
  }, [inView, setActiveSection, section.id]);

  const Icon = section.icon;

  return (
    <motion.section
      id={section.id}
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="scroll-mt-32 mb-8"
    >
      <div className="bg-white rounded-2xl p-8 shadow-[0_2px_10px_rgba(15,23,42,0.03)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(99,102,241,0.06)] transition-all duration-300">
        
        {/* Subtle decorative background icon */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none transform translate-x-4 -translate-y-4">
          <Icon className="w-32 h-32 text-slate-900" />
        </div>

        <div className="flex items-center gap-4 mb-5 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700 shrink-0 border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors duration-300">
            <Icon className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{section.title}</h2>
        </div>
        <div className="text-slate-600 leading-relaxed relative z-10">
          {section.content}
        </div>
      </div>
    </motion.section>
  );
};

const Terms = () => {
  const [activeSection, setActiveSection] = useState(termsSections[0].id);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      
      {/* Reading Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-indigo-600 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <header className="relative bg-white border-b border-slate-100 pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-white opacity-60"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6"
          >
            Terms & Conditions
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Please read these Terms & Conditions carefully before using StreamKart. By accessing or using our platform, you agree to comply with these terms.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl py-4 px-8 inline-flex mx-auto"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">Effective Date:</span>
              <span>{currentDate}</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block mt-2"></div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">Last Updated:</span>
              <span>{currentDate}</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block mt-2"></div>
            <div className="flex items-center gap-2 text-indigo-600 font-medium">
              <span>Est. Reading Time: 10 mins</span>
            </div>
          </motion.div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 flex flex-col lg:flex-row gap-12 relative">
        
        {/* Sticky Sidebar Navigation (Desktop) */}
        <aside className="w-full lg:w-72 shrink-0 hidden lg:block">
          <div className="sticky top-28 bg-white/60 backdrop-blur-xl border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Table of Contents</h3>
            <nav className="flex flex-col space-y-1">
              {termsSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => handleNavClick(e, section.id)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-3 ${
                    activeSection === section.id 
                      ? "bg-indigo-50 text-indigo-700 font-medium shadow-[inset_2px_0_0_0_#4f46e5]" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="truncate">{section.title}</span>
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile Navigation Dropdown */}
        <div className="lg:hidden w-full bg-white border border-slate-200 rounded-xl p-4 sticky top-20 z-30 shadow-sm">
          <select 
            className="w-full bg-transparent border-none text-slate-700 font-medium focus:ring-0 cursor-pointer"
            value={activeSection}
            onChange={(e) => {
              const id = e.target.value;
              setActiveSection(id);
              const element = document.getElementById(id);
              if (element) {
                const y = element.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }}
          >
            {termsSections.map(section => (
              <option key={section.id} value={section.id}>{section.title}</option>
            ))}
          </select>
        </div>

        {/* Content Area */}
        <main className="flex-1 max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-10 text-slate-600 leading-relaxed text-lg"
          >
            <p>Welcome to STREAM KART. By using this platform you agree to these Terms & Conditions.</p>
          </motion.div>

          <div className="space-y-4">
            {termsSections.map((section) => (
              <TermSection 
                key={section.id} 
                section={section} 
                setActiveSection={setActiveSection} 
              />
            ))}
          </div>

          {/* Final CTA Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-slate-900 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
          >
            {/* Background glowing effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold text-white mb-4">Questions About Our Terms?</h3>
              <p className="text-slate-300 mb-10 text-lg">
                If you have any questions regarding these Terms & Conditions or your responsibilities while using StreamKart, our support team is here to help.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/contact" className="inline-flex items-center justify-center px-8 py-3.5 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors w-full sm:w-auto shadow-lg shadow-indigo-500/25">
                  Contact Support
                </Link>
                <div className="flex items-center gap-6 px-6 py-3.5 bg-white/5 rounded-xl border border-white/10 w-full sm:w-auto justify-center">
                  <a href="mailto:creativecornerpass@gmail.com" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                    <FiMail className="w-4 h-4" />
                    <span className="text-sm">Email Us</span>
                  </a>
                  <div className="w-px h-4 bg-white/20"></div>
                  <a href="https://streamkart.in" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                    <FiGlobe className="w-4 h-4" />
                    <span className="text-sm">Website</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

        </main>

      </div>
    </div>
  );
};

export default Terms;
