import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { 
  FiCheckCircle, FiAlertTriangle, FiCreditCard, FiActivity, 
  FiUserX, FiShield, FiMail, FiGlobe, FiChevronRight,
  FiUserCheck, FiList, FiShoppingCart, FiTruck, FiDollarSign, FiClock
} from 'react-icons/fi';

const sellerSections = [
  {
    id: "section-1",
    title: "1. Eligibility",
    content: (
      <>
        <p className="mb-4">To sell on StreamKart, sellers must:</p>
        <ul className="list-disc pl-5 space-y-2 text-slate-700">
          <li>Complete the required seller verification process.</li>
          <li>Provide accurate and up-to-date information.</li>
          <li>Comply with all applicable laws and regulations.</li>
          <li>Maintain an active and valid StreamKart account.</li>
          <li>Accept and follow all StreamKart marketplace policies.</li>
        </ul>
      </>
    )
  },
  {
    id: "section-2",
    title: "2. Seller Responsibilities",
    content: (
      <>
        <p className="mb-6">Every seller is responsible for:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            "Listing only eligible digital products or services.",
            "Ensuring all product information is accurate and up to date.",
            "Providing truthful pricing, descriptions, and delivery details.",
            "Delivering purchased products within the committed delivery time.",
            "Responding promptly to buyer inquiries.",
            "Maintaining professional communication with buyers.",
            "Providing genuine and valid digital products.",
            "Following all applicable marketplace policies."
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
              <FiCheckCircle className="text-emerald-500 w-5 h-5 shrink-0 mt-0.5" />
              <span className="text-emerald-900 text-sm font-medium">{item}</span>
            </div>
          ))}
        </div>
      </>
    )
  },
  {
    id: "section-3",
    title: "3. Product Listings",
    content: (
      <>
        <p className="mb-4">Sellers must ensure that every listing:</p>
        <ul className="list-disc pl-5 space-y-2 mb-6 text-slate-700">
          <li>Contains accurate descriptions.</li>
          <li>Includes correct pricing.</li>
          <li>Clearly specifies delivery timelines.</li>
          <li>Does not contain misleading information.</li>
          <li>Complies with StreamKart listing guidelines.</li>
        </ul>
        <p className="text-sm font-medium text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-100">
          StreamKart reserves the right to edit, suspend, reject, or remove listings that violate marketplace policies.
        </p>
      </>
    )
  },
  {
    id: "section-4",
    title: "4. Order Fulfillment",
    content: (
      <>
        <p className="mb-4">Sellers are responsible for:</p>
        <ul className="list-disc pl-5 space-y-2 text-slate-700 mb-10">
          <li>Delivering purchased products within the promised timeframe.</li>
          <li>Providing accurate delivery information.</li>
          <li>Resolving delivery-related issues promptly.</li>
          <li>Cooperating with buyers during order completion.</li>
          <li>Maintaining a high delivery success rate.</li>
        </ul>
        
        {/* Workflow Timeline */}
        <div className="mt-8 mb-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Seller Workflow Timeline</h4>
          <div className="flex flex-col md:flex-row justify-between items-center relative gap-4 md:gap-0">
            <div className="hidden md:block absolute top-1/2 left-6 right-6 h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
            
            {[
              { icon: FiUserCheck, label: "Verification" },
              { icon: FiList, label: "Create Listing" },
              { icon: FiShoppingCart, label: "Receive Order" },
              { icon: FiTruck, label: "Deliver Product" },
              { icon: FiDollarSign, label: "Wallet Earnings" },
              { icon: FiCreditCard, label: "Withdraw Funds" }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-3 bg-white md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none w-full md:w-auto border md:border-none border-slate-100 shadow-sm md:shadow-none">
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0 relative">
                  <step.icon className="w-5 h-5" />
                  {idx !== 5 && <FiChevronRight className="absolute -right-5 text-slate-300 md:hidden w-4 h-4" />}
                </div>
                <span className="text-xs font-semibold text-slate-700 text-center">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  },
  {
    id: "section-5",
    title: "5. Payments & Seller Wallet",
    content: (
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white mb-6 border border-white/10">
            <FiCreditCard className="w-6 h-6" />
          </div>
          <div className="space-y-4 text-slate-300">
            <p>Seller earnings are processed through the StreamKart Wallet System.</p>
            <p>Platform commissions may be deducted before funds become available.</p>
            <p>Withdrawals are processed according to the marketplace settlement schedule after successful order completion, verification, and applicable holding periods.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "section-6",
    title: "6. Prohibited Activities",
    content: (
      <>
        <p className="mb-6">Sellers must not:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {[
            "List unauthorized or illegal products.",
            "Sell fraudulent, stolen, or misleading products.",
            "Misrepresent products or services.",
            "Manipulate reviews or ratings.",
            "Circumvent the marketplace.",
            "Contact buyers outside approved communication channels to avoid platform fees.",
            "Share buyer information without authorization.",
            "Engage in fraudulent or abusive activity."
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-rose-50 border border-rose-100 p-3 rounded-xl">
              <FiAlertTriangle className="text-rose-500 w-4 h-4 shrink-0" />
              <span className="text-rose-900 text-sm font-medium">{item}</span>
            </div>
          ))}
        </div>
        <p className="text-sm font-semibold text-rose-600">Violation of these rules may result in immediate enforcement action.</p>
      </>
    )
  },
  {
    id: "section-7",
    title: "7. Seller Performance",
    content: (
      <>
        <p className="mb-6">To maintain marketplace quality, StreamKart may monitor:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Delivery success rate", icon: FiTruck },
            { label: "Customer satisfaction", icon: FiCheckCircle },
            { label: "Response time", icon: FiClock },
            { label: "Cancellation rate", icon: FiUserX },
            { label: "Dispute history", icon: FiAlertTriangle },
            { label: "Policy violations", icon: FiShield }
          ].map((metric, i) => (
            <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
              <metric.icon className="text-indigo-500 w-5 h-5" />
              <span className="text-xs font-semibold text-slate-700">{metric.label}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-500 italic">Poor performance may affect seller visibility or account status.</p>
      </>
    )
  },
  {
    id: "section-8",
    title: "8. Account Suspension & Enforcement",
    content: (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h4 className="text-amber-900 font-bold mb-4 flex items-center gap-2">
          <FiUserX className="w-5 h-5" />
          StreamKart may temporarily suspend or permanently terminate seller accounts for reasons including:
        </h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-amber-800 text-sm font-medium">
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div> Fraudulent activity.</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div> Repeated customer complaints.</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div> Policy violations.</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div> Misleading listings.</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div> Failure to fulfill orders.</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div> Abuse of the platform.</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div> Violation of applicable laws.</li>
          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div> Repeated violations of marketplace policies.</li>
        </ul>
      </div>
    )
  },
  {
    id: "section-9",
    title: "9. Seller Liability",
    content: (
      <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm">
        <p className="mb-4 text-slate-900 font-medium">Sellers are solely responsible for:</p>
        <ul className="list-disc pl-5 space-y-2 text-slate-600 mb-6">
          <li>The legality of the products they list.</li>
          <li>The accuracy of listing information.</li>
          <li>Product delivery.</li>
          <li>Customer commitments.</li>
          <li>Compliance with applicable laws.</li>
        </ul>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-500">
          StreamKart acts as a marketplace facilitator and is not responsible for seller-generated content or seller obligations.
        </div>
      </div>
    )
  },
  {
    id: "section-10",
    title: "10. Policy Updates",
    content: (
      <>
        <p className="mb-4">StreamKart may update this Seller Policy from time to time.</p>
        <p className="mb-4">Updated versions will be published on this page.</p>
        <p>Continued use of seller features after updates become effective constitutes acceptance of the revised Seller Policy.</p>
      </>
    )
  },
  {
    id: "section-11",
    title: "11. Contact Us",
    content: (
      <>
        <p className="mb-6">For questions regarding this Seller Policy, please contact:</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="mailto:creativecornerpass@gmail.com" className="flex-1 flex items-center gap-4 p-5 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-sm">
              <FiMail className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">Email</span>
              <span className="block text-indigo-900 font-semibold text-sm">creativecornerpass@gmail.com</span>
            </div>
          </a>
          
          <a href="https://streamkart.in" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center gap-4 p-5 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-sm">
              <FiGlobe className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">Website</span>
              <span className="block text-indigo-900 font-semibold text-sm">https://streamkart.in</span>
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
      className="scroll-mt-32 mb-12"
    >
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">{section.title}</h2>
      <div className="text-slate-600 leading-relaxed text-lg">
        {section.content}
      </div>
    </motion.section>
  );
};

const SellerPolicy = () => {
  const [activeSection, setActiveSection] = useState(sellerSections[0].id);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
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
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6"
          >
            Seller Policy
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Learn about the responsibilities, standards, and marketplace rules every seller must follow while selling on StreamKart.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 bg-white border border-slate-200 shadow-sm rounded-full py-3 px-8 inline-flex mx-auto"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400 uppercase tracking-widest text-[10px]">Effective Date</span>
              <span className="font-medium text-slate-800">{currentDate}</span>
            </div>
            <div className="w-px h-5 bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400 uppercase tracking-widest text-[10px]">Last Updated</span>
              <span className="font-medium text-slate-800">{currentDate}</span>
            </div>
            <div className="w-px h-5 bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-2 text-indigo-600">
              <span className="font-semibold text-indigo-400 uppercase tracking-widest text-[10px]">Est. Reading Time</span>
              <span className="font-medium">10 mins</span>
            </div>
          </motion.div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 flex flex-col lg:flex-row gap-16 relative">
        
        {/* Sticky Sidebar Navigation (Desktop) */}
        <aside className="w-full lg:w-72 shrink-0 hidden lg:block">
          <div className="sticky top-28">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-3">Table of Contents</h3>
            <nav className="flex flex-col border-l border-slate-100">
              {sellerSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => handleNavClick(e, section.id)}
                  className={`pl-4 py-2.5 text-sm transition-all duration-200 border-l-[3px] -ml-[2px] ${
                    activeSection === section.id 
                      ? "border-indigo-600 text-indigo-700 font-semibold" 
                      : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                  }`}
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile Navigation Dropdown */}
        <div className="lg:hidden w-full bg-white border border-slate-200 rounded-xl p-4 sticky top-20 z-30 shadow-sm mb-8">
          <select 
            className="w-full bg-transparent border-none text-slate-800 font-semibold focus:ring-0 cursor-pointer"
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
            {sellerSections.map(section => (
              <option key={section.id} value={section.id}>{section.title}</option>
            ))}
          </select>
        </div>

        {/* Content Area */}
        <main className="flex-1 max-w-3xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-16 text-slate-700 leading-relaxed text-lg"
          >
            <p className="mb-4">Welcome to StreamKart. This Seller Policy outlines the responsibilities, obligations, and standards that every seller must follow while using the StreamKart marketplace.</p>
            <p>By registering as a seller, listing products, or accepting orders through StreamKart, you acknowledge that you have read, understood, and agreed to comply with this Seller Policy.</p>
          </motion.div>

          <div className="space-y-4">
            {sellerSections.map((section) => (
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
            className="mt-20 bg-[#F8FAFC] border border-slate-200 rounded-[24px] p-10 md:p-14 text-center"
          >
            <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Become a Verified Seller</h3>
            <p className="text-slate-600 mb-10 text-lg max-w-xl mx-auto">
              Join StreamKart and grow your digital business through a secure, transparent, and professionally managed marketplace.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="inline-flex items-center justify-center px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors w-full sm:w-auto shadow-sm">
                Become a Seller
              </Link>
              <Link to="/contact" className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-slate-700 border border-slate-300 rounded-xl font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors w-full sm:w-auto shadow-sm">
                Contact Support
              </Link>
            </div>
          </motion.div>

        </main>

      </div>
    </div>
  );
};

export default SellerPolicy;
