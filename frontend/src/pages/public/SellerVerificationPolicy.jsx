import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { 
  FiCheckCircle, FiAlertTriangle, FiShield, FiFileText,
  FiMail, FiGlobe, FiChevronDown, FiUserCheck, FiUploadCloud, 
  FiSearch, FiLock, FiSettings
} from 'react-icons/fi';

const verificationSections = [
  {
    id: "section-1",
    title: "1. Seller Eligibility",
    content: (
      <>
        <p className="mb-6">To apply as a seller on StreamKart, applicants must:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {[
            "Provide a valid email address.",
            "Provide an active WhatsApp mobile number.",
            "Submit accurate and complete registration information.",
            "Accept the StreamKart Terms & Conditions, Seller Policy, Privacy Policy, and other applicable marketplace policies.",
            "Maintain an active user account in good standing."
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
              <FiCheckCircle className="text-emerald-500 w-5 h-5 shrink-0 mt-0.5" />
              <span className="text-emerald-900 text-sm font-medium leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
        <p className="text-sm font-medium text-slate-500 italic">Meeting these requirements does not guarantee seller approval.</p>
      </>
    )
  },
  {
    id: "section-2",
    title: "2. Seller Verification Process",
    content: (
      <>
        <p className="mb-8 text-lg">To ensure marketplace safety, every seller application undergoes a verification process. The process generally includes:</p>
        
        <div className="relative pl-4 md:pl-0">
          {/* Vertical line */}
          <div className="absolute left-9 top-6 bottom-6 w-0.5 bg-slate-100 hidden md:block"></div>
          
          <div className="space-y-6 md:space-y-8 relative z-10">
            {[
              { step: "Step 1", title: "Seller Application", desc: "Seller submits a seller application.", icon: FiFileText },
              { step: "Step 2", title: "Submit Information", desc: "Seller provides: Email Address, WhatsApp Number, Required registration information", icon: FiUploadCloud },
              { step: "Step 3", title: "Admin Review", desc: "The StreamKart Administration Team reviews the submitted information.", icon: FiSearch },
              { step: "Step 4", title: "Additional Verification (If Required)", desc: "If additional verification is required, StreamKart may contact the applicant through their registered email address or WhatsApp number to request clarification or additional information.", icon: FiShield },
              { step: "Step 5", title: "Seller Approved", desc: "Once verification is successfully completed, the seller account will be approved and seller features will be activated.", icon: FiUserCheck }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-4 md:gap-8 group">
                <div className="flex md:flex-col items-center gap-4 md:gap-2 shrink-0">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm relative group-hover:border-indigo-600 transition-colors z-10">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest md:hidden">{item.step}</span>
                </div>
                
                <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-[0_2px_10px_rgba(15,23,42,0.02)] group-hover:shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                    <span className="hidden md:block text-xs font-bold text-indigo-400 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">{item.step}</span>
                  </div>
                  <p className="text-slate-600 text-sm md:text-base">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  },
  {
    id: "section-3",
    title: "3. Approval & Verification Rights",
    content: (
      <div className="bg-indigo-900 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10">
          <p className="mb-6 text-indigo-100 text-lg">StreamKart reserves the right to:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              "Approve seller applications.",
              "Reject seller applications.",
              "Suspend seller accounts.",
              "Request additional information.",
              "Re-verify seller accounts where necessary.",
              "Permanently terminate seller access for policy violations."
            ].map((right, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></div>
                <span className="font-medium">{right}</span>
              </li>
            ))}
          </ul>
          <div className="pt-6 border-t border-indigo-800">
            <p className="text-sm font-semibold text-indigo-300">Seller approval is granted at StreamKart's sole discretion.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "section-4",
    title: "4. Reasons for Rejection or Suspension",
    content: (
      <>
        <p className="mb-6">Seller applications or accounts may be rejected, suspended, or terminated for reasons including:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {[
            "Incorrect or misleading information.",
            "Failure to respond to verification requests.",
            "Fraudulent or suspicious activity.",
            "Violation of marketplace policies.",
            "Violation of applicable laws.",
            "Multiple fraudulent accounts.",
            "Abuse of the marketplace.",
            "Any activity that may compromise marketplace security or user trust."
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <FiAlertTriangle className="text-amber-500 w-5 h-5 shrink-0 mt-0.5" />
              <span className="text-amber-900 text-sm font-medium leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </>
    )
  },
  {
    id: "section-5",
    title: "5. Seller Responsibilities",
    content: (
      <>
        <p className="mb-6">Verified sellers are responsible for:</p>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
          <ul className="space-y-4">
            {[
              "Maintaining accurate account information.",
              "Keeping their registered email address active.",
              "Keeping their registered WhatsApp number active.",
              "Promptly notifying StreamKart of important account changes.",
              "Cooperating with future verification requests if required."
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span className="text-slate-700 font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm font-medium text-slate-500 italic">Failure to maintain accurate information may affect seller eligibility.</p>
      </>
    )
  },
  {
    id: "section-6",
    title: "6. Re-Verification",
    content: (
      <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm">
        <p className="mb-4 text-slate-900 font-medium">To maintain marketplace integrity, StreamKart may require sellers to complete additional verification in situations including:</p>
        <ul className="list-disc pl-5 space-y-2 text-slate-600 mb-6">
          <li>Significant account changes.</li>
          <li>Security concerns.</li>
          <li>Suspicious activity.</li>
          <li>Marketplace compliance reviews.</li>
          <li>Policy investigations.</li>
        </ul>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-500">
          Failure to complete re-verification may result in temporary suspension of seller privileges.
        </div>
      </div>
    )
  },
  {
    id: "section-7",
    title: "7. Privacy & Security",
    content: (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
            <FiLock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Data Protection</h4>
            <p className="text-sm text-slate-500">Information submitted during seller verification is handled in accordance with the StreamKart Privacy Policy.</p>
          </div>
        </div>
        
        <p className="mb-4 font-medium text-slate-900">Verification information is used solely for:</p>
        <div className="flex flex-wrap gap-2">
          {["Seller verification", "Marketplace security", "Fraud prevention", "Compliance", "Customer protection"].map((badge, idx) => (
            <span key={idx} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-2">
              <FiShield className="w-4 h-4 text-indigo-500" />
              {badge}
            </span>
          ))}
        </div>
      </div>
    )
  },
  {
    id: "section-8",
    title: "8. Policy Updates",
    content: (
      <>
        <p className="mb-4">StreamKart reserves the right to modify this Seller Verification Policy at any time.</p>
        <p className="mb-4">Updated versions will be published on this page with the revised Effective Date.</p>
        <p>Continued use of seller features after policy updates become effective constitutes acceptance of the updated policy.</p>
      </>
    )
  },
  {
    id: "section-9",
    title: "9. Contact Us",
    content: (
      <>
        <p className="mb-6">For questions regarding seller verification, please contact:</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="mailto:creativecornerpass@gmail.com" className="flex-1 flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FiMail className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email</span>
              <span className="block text-slate-900 font-semibold text-sm">creativecornerpass@gmail.com</span>
            </div>
          </a>
          
          <a href="https://streamkart.in" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FiGlobe className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Website</span>
              <span className="block text-slate-900 font-semibold text-sm">https://streamkart.in</span>
            </div>
          </a>
        </div>
      </>
    )
  }
];

const PolicySection = ({ section, setActiveSection }) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    rootMargin: "-20% 0px -50% 0px"
  });

  useEffect(() => {
    if (inView) {
      setActiveSection(section.id);
    }
  }, [inView, setActiveSection, section.id]);

  return (
    <motion.section
      id={section.id}
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="scroll-mt-32 mb-16"
    >
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-8">{section.title}</h2>
      <div className="text-slate-600 leading-relaxed text-lg">
        {section.content}
      </div>
    </motion.section>
  );
};

const SellerVerificationPolicy = () => {
  const [activeSection, setActiveSection] = useState(verificationSections[0].id);
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
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      
      {/* Reading Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-indigo-600 origin-left z-50 shadow-sm"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <header className="relative bg-[#FAFAFA] border-b border-slate-200 pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-8 border border-indigo-100"
          >
            <FiShield className="w-4 h-4" /> Compliance & Trust
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6"
          >
            Seller Verification Policy
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Understand how StreamKart verifies sellers to maintain a secure, transparent, and trusted marketplace for buyers and sellers.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 bg-white border border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.02)] rounded-2xl py-4 px-8 inline-flex mx-auto"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Effective Date</span>
              <span className="font-semibold text-slate-800">{currentDate}</span>
            </div>
            <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
            <div className="flex flex-col items-start gap-1">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Last Updated</span>
              <span className="font-semibold text-slate-800">{currentDate}</span>
            </div>
            <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
            <div className="flex flex-col items-start gap-1 text-indigo-600">
              <span className="font-bold text-indigo-400 uppercase tracking-widest text-[10px]">Est. Reading Time</span>
              <span className="font-semibold">10 mins</span>
            </div>
          </motion.div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 flex flex-col lg:flex-row gap-16 relative">
        
        {/* Sticky Sidebar Navigation (Desktop) */}
        <aside className="w-full lg:w-72 shrink-0 hidden lg:block">
          <div className="sticky top-28">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 px-4">Contents</h3>
            <nav className="flex flex-col space-y-1">
              {verificationSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => handleNavClick(e, section.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm transition-all duration-200 font-medium ${
                    activeSection === section.id 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile Navigation Dropdown */}
        <div className="lg:hidden w-full bg-white border border-slate-200 rounded-2xl p-4 sticky top-20 z-30 shadow-sm mb-8">
          <div className="relative">
            <select 
              className="w-full bg-transparent border-none text-slate-800 font-bold focus:ring-0 cursor-pointer appearance-none pr-10"
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
              {verificationSections.map(section => (
                <option key={section.id} value={section.id}>{section.title}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 max-w-3xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-16 text-slate-700 leading-relaxed text-lg bg-[#FAFAFA] border border-slate-200 rounded-3xl p-8"
          >
            <p className="mb-4">Welcome to StreamKart. To maintain a secure, transparent, and trustworthy marketplace, every seller must successfully complete the Seller Verification process before being permitted to create listings or sell products through the StreamKart platform.</p>
            <p className="mb-4">The verification process helps protect buyers, improve marketplace integrity, reduce fraudulent activity, and ensure that only verified sellers participate in the marketplace.</p>
            <p className="font-semibold text-slate-900">By applying for a seller account, you acknowledge that you have read, understood, and agreed to this Seller Verification Policy.</p>
          </motion.div>

          <div className="space-y-4">
            {verificationSections.map((section) => (
              <PolicySection 
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
            className="mt-24 bg-slate-900 rounded-[32px] p-10 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
            
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight">Ready to Become a Verified Seller?</h3>
              <p className="text-slate-300 mb-10 text-lg max-w-xl mx-auto">
                Complete the seller verification process and start selling through a secure and professionally managed marketplace.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="inline-flex items-center justify-center px-10 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 transition-colors w-full sm:w-auto shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]">
                  Become a Seller
                </Link>
                <Link to="/contact" className="inline-flex items-center justify-center px-10 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 backdrop-blur-sm transition-colors w-full sm:w-auto">
                  Contact Support
                </Link>
              </div>
            </div>
          </motion.div>

        </main>

      </div>
    </div>
  );
};

export default SellerVerificationPolicy;
