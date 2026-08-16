import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { 
  FiFileText, FiCheckCircle, FiAlertCircle, FiClock, 
  FiSearch, FiRefreshCw, FiPieChart, FiShield, 
  FiUsers, FiRefreshCcw, FiMail, FiGlobe
} from 'react-icons/fi';

const refundSections = [
  {
    id: "section-1",
    title: "1. Nature of Digital Products",
    icon: FiFileText,
    content: (
      <>
        <p className="mb-4">StreamKart is a customer-to-customer (C2C) digital marketplace that facilitates transactions between buyers and verified sellers.</p>
        <p>Most products available on the platform are digital in nature and are delivered electronically. Due to the nature of digital products, refund eligibility is limited once delivery has been successfully completed.</p>
      </>
    )
  },
  {
    id: "section-2",
    title: "2. Eligible Refund Requests",
    icon: FiCheckCircle,
    content: (
      <>
        <p className="mb-6">A refund request may be considered in the following situations:</p>
        <div className="grid gap-3">
          {[
            "The purchased product or service could not be delivered due to a technical issue attributable to the platform or verified seller.",
            "The customer was charged multiple times for the same order.",
            "An incorrect product or plan was delivered and the issue cannot reasonably be corrected.",
            "The order cannot be fulfilled within the promised delivery timeframe.",
            "The verified seller is unable to complete the order after payment has been successfully received.",
            "The delivered product is materially different from the purchased listing and cannot be resolved through replacement or correction.",
            "The order is cancelled by the platform before successful delivery."
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
              <FiCheckCircle className="text-emerald-600 w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-emerald-900 text-sm md:text-base leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm font-medium text-slate-600">All refund requests are reviewed individually.</p>
      </>
    )
  },
  {
    id: "section-3",
    title: "3. Non-Refundable Situations",
    icon: FiAlertCircle,
    content: (
      <>
        <p className="mb-6">Refunds will generally not be provided under the following circumstances:</p>
        <div className="grid gap-3">
          {[
            "The product has already been successfully delivered.",
            "The buyer has successfully accessed or activated the delivered product or service.",
            "Incorrect account details or information were provided by the buyer.",
            "The buyer selected the wrong product, duration, or plan.",
            "The buyer changes their mind after successful delivery.",
            "A third-party service modifies its pricing, features, policies, or availability after purchase.",
            "The product becomes unusable due to actions or policy violations committed by the buyer.",
            "The buyer violates the marketplace Terms & Conditions.",
            "Refund requests are submitted outside the applicable reporting period without a valid reason."
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-rose-50 border border-rose-100 p-4 rounded-xl">
              <FiAlertCircle className="text-rose-600 w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-rose-900 text-sm md:text-base leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </>
    )
  },
  {
    id: "section-4",
    title: "4. Refund Request Process",
    icon: FiClock,
    content: (
      <>
        <p className="mb-6">To request a refund, buyers should contact StreamKart Support and provide:</p>
        <ul className="list-disc pl-5 space-y-2 mb-8 text-slate-700">
          <li>Order ID</li>
          <li>Registered Email Address</li>
          <li>Description of the issue</li>
          <li>Supporting evidence (if applicable)</li>
        </ul>
        
        {/* Timeline Visualization */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 mt-4 overflow-hidden relative">
          <div className="hidden md:block absolute top-1/2 left-8 right-8 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 md:gap-4">
            {[
              { step: 1, title: "Purchase" },
              { step: 2, title: "Refund Request" },
              { step: 3, title: "Investigation" },
              { step: 4, title: "Approval / Rejection" },
              { step: 5, title: "Refund Processed" }
            ].map((phase, i) => (
              <div key={i} className="flex md:flex-col items-center gap-4 md:gap-3 flex-1 text-center group">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center text-indigo-600 font-bold shadow-sm shrink-0 transition-transform group-hover:scale-110">
                  {phase.step}
                </div>
                <span className="text-sm font-semibold text-slate-800">{phase.title}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-slate-600 italic">Our support team may request additional information to investigate the request.</p>
      </>
    )
  },
  {
    id: "section-5",
    title: "5. Review & Investigation",
    icon: FiSearch,
    content: (
      <>
        <p className="mb-4">Each refund request is reviewed based on:</p>
        <div className="flex flex-wrap gap-3 mb-6">
          {["Order history", "Delivery records", "Buyer–seller communication", "Platform logs", "Supporting documentation"].map((badge, idx) => (
            <div key={idx} className="px-4 py-2 bg-indigo-50 text-indigo-700 font-medium text-sm rounded-lg border border-indigo-100 flex items-center gap-2">
              <FiFileText className="w-4 h-4" />
              {badge}
            </div>
          ))}
        </div>
        <p>Additional verification may be required before a final decision is made.</p>
      </>
    )
  },
  {
    id: "section-6",
    title: "6. Refund Processing",
    icon: FiRefreshCw,
    content: (
      <>
        <p className="mb-4">If a refund request is approved:</p>
        <ul className="space-y-4">
          <li className="flex gap-3 text-slate-700 items-start">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5"><div className="w-2 h-2 bg-slate-600 rounded-full"></div></div>
            Refunds are generally processed within 5–7 business days.
          </li>
          <li className="flex gap-3 text-slate-700 items-start">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5"><div className="w-2 h-2 bg-slate-600 rounded-full"></div></div>
            Refunds will be issued to the user's provided bank account or UPI ID.
          </li>
          <li className="flex gap-3 text-slate-700 items-start">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5"><div className="w-2 h-2 bg-slate-600 rounded-full"></div></div>
            Processing time may vary depending on manual verification and bank processing times.
          </li>
        </ul>
      </>
    )
  },
  {
    id: "section-7",
    title: "7. Partial Refunds",
    icon: FiPieChart,
    content: (
      <>
        <p className="mb-4">In certain situations, StreamKart may approve a partial refund if only part of the purchased service could not be fulfilled.</p>
        <p>The refund amount will depend on the circumstances of the order.</p>
      </>
    )
  },
  {
    id: "section-8",
    title: "8. Fraud Prevention",
    icon: FiShield,
    content: (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8">
        <h4 className="text-amber-900 font-bold mb-4 flex items-center gap-2">
          <FiAlertCircle className="w-5 h-5" />
          To protect buyers and sellers, StreamKart reserves the right to decline refund requests involving:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {[
            "Fraudulent claims",
            "Abuse of the refund process",
            "Duplicate refund requests",
            "False information",
            "Manipulated evidence",
            "Marketplace policy violations"
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-amber-800">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"></div>
              <span className="font-medium text-sm md:text-base">{item}</span>
            </div>
          ))}
        </div>
        <p className="text-amber-900/80 text-sm font-semibold border-t border-amber-200 pt-4">
          Fraudulent activity may result in suspension or permanent termination of the user account.
        </p>
      </div>
    )
  },
  {
    id: "section-9",
    title: "9. Dispute Resolution",
    icon: FiUsers,
    content: (
      <>
        <p className="mb-4">If a buyer and seller are unable to resolve an issue, StreamKart may review the available information and facilitate dispute resolution in accordance with our marketplace policies.</p>
        <p>Our decision will be based on the available evidence and applicable platform policies.</p>
      </>
    )
  },
  {
    id: "section-10",
    title: "10. Policy Updates",
    icon: FiRefreshCcw,
    content: (
      <>
        <p className="mb-4">StreamKart reserves the right to update this Refund Policy at any time.</p>
        <p className="mb-4">Updated versions will be published on this page with the revised Effective Date.</p>
        <p>Continued use of the platform after updates become effective constitutes acceptance of the revised Refund Policy.</p>
      </>
    )
  },
  {
    id: "section-11",
    title: "11. Contact Us",
    icon: FiMail,
    content: (
      <>
        <p className="mb-6">If you have any questions regarding this Refund Policy or wish to request a refund, please contact our support team.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href="mailto:creativecornerpass@gmail.com" className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-indigo-300 hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FiMail className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</span>
              <span className="block text-slate-900 font-medium group-hover:text-indigo-600">creativecornerpass@gmail.com</span>
            </div>
          </a>
          
          <a href="https://streamkart.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-indigo-300 hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FiGlobe className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Website</span>
              <span className="block text-slate-900 font-medium group-hover:text-indigo-600">https://streamkart.in</span>
            </div>
          </a>
        </div>
      </>
    )
  }
];

const RefundSection = ({ section, setActiveSection }) => {
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
      className="scroll-mt-32 mb-10"
    >
      <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-[0_4px_20px_rgba(15,23,42,0.04)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_10px_40px_rgba(0,82,255,0.06)] transition-all duration-300">
        
        {/* Subtle decorative background icon */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none transform translate-x-4 -translate-y-4">
          <Icon className="w-32 h-32 text-slate-900" />
        </div>

        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700 shrink-0 border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors duration-300">
            <Icon className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{section.title}</h2>
        </div>
        <div className="text-slate-700 leading-relaxed text-lg relative z-10 font-medium">
          {section.content}
        </div>
      </div>
    </motion.section>
  );
};

const RefundPolicy = () => {
  const [activeSection, setActiveSection] = useState(refundSections[0].id);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
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
    <div className="min-h-screen bg-[#FBF8FF] font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
      
      {/* Reading Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-blue-600 origin-left z-50 shadow-sm"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <header className="relative bg-white border-b border-slate-200 pt-32 pb-24 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white opacity-80"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-6 border border-blue-100"
          >
            <FiRefreshCw className="w-4 h-4" /> Policy Documentation
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6"
          >
            Refund Policy
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Learn how StreamKart reviews, investigates, and processes eligible refund requests while maintaining a secure and transparent marketplace.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-8 text-sm text-slate-500 bg-white border border-slate-200 shadow-sm rounded-2xl py-5 px-10 inline-flex mx-auto relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex flex-col items-start gap-1">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Effective Date</span>
              <span className="font-semibold text-slate-900">{currentDate}</span>
            </div>
            <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
            <div className="flex flex-col items-start gap-1">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Last Updated</span>
              <span className="font-semibold text-slate-900">{currentDate}</span>
            </div>
            <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
            <div className="flex flex-col items-start gap-1 text-blue-700">
              <span className="font-bold text-blue-400 uppercase tracking-widest text-[10px]">Est. Reading Time</span>
              <span className="font-semibold">10 mins</span>
            </div>
          </motion.div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 flex flex-col lg:flex-row gap-16 relative">
        
        {/* Sticky Sidebar Navigation (Desktop) */}
        <aside className="w-full lg:w-80 shrink-0 hidden lg:block">
          <div className="sticky top-28 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-4">Table of Contents</h3>
            <nav className="flex flex-col space-y-1">
              {refundSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => handleNavClick(e, section.id)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                    activeSection === section.id 
                      ? "bg-blue-50 text-blue-700 shadow-[inset_3px_0_0_0_#0052ff]" 
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
        <div className="lg:hidden w-full bg-white border border-slate-200 rounded-2xl p-4 sticky top-20 z-30 shadow-sm mb-8">
          <select 
            className="w-full bg-transparent border-none text-slate-900 font-semibold focus:ring-0 cursor-pointer text-lg"
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
            {refundSections.map(section => (
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
            className="mb-12 text-slate-700 leading-relaxed text-xl font-medium bg-white p-8 border border-slate-200 shadow-sm rounded-3xl"
          >
            <p className="mb-4">Welcome to StreamKart. We strive to provide a secure, transparent, and reliable marketplace experience for buyers and sellers. This Refund Policy explains the circumstances under which refunds may be requested, reviewed, and processed.</p>
            <p>By placing an order on StreamKart, you acknowledge that you have read, understood, and agreed to this Refund Policy.</p>
          </motion.div>

          <div className="space-y-4">
            {refundSections.map((section) => (
              <RefundSection 
                key={section.id} 
                section={section} 
                setActiveSection={setActiveSection} 
              />
            ))}
          </div>

          {/* Final CTA Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 bg-[#0F172A] rounded-[32px] p-12 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-4xl font-extrabold text-white mb-6 tracking-tight">Need Help With a Refund?</h3>
              <p className="text-slate-300 mb-12 text-xl">
                Our support team is here to review your request and assist you throughout the refund process.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <Link to="/contact" className="inline-flex items-center justify-center px-10 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-500 transition-colors w-full sm:w-auto shadow-[0_0_20px_rgba(0,82,255,0.3)] hover:shadow-[0_0_30px_rgba(0,82,255,0.5)]">
                  Contact Support
                </Link>
                <Link to="/products" className="inline-flex items-center justify-center px-10 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors w-full sm:w-auto backdrop-blur-sm">
                  Back to Marketplace
                </Link>
              </div>
            </div>
          </motion.div>

        </main>

      </div>
    </div>
  );
};

export default RefundPolicy;
