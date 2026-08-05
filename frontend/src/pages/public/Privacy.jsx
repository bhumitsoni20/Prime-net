import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  FiInfo, FiDatabase, FiCreditCard, FiActivity, 
  FiMessageSquare, FiGlobe, FiShare2, FiShield, 
  FiArchive, FiUserCheck, FiLink, FiUsers, 
  FiRefreshCw, FiMail
} from 'react-icons/fi';

const privacySections = [
  {
    id: "section-1",
    title: "1. Who We Are",
    icon: FiInfo,
    content: (
      <>
        <p className="mb-4">StreamKart is a customer-to-customer (C2C) digital marketplace that connects verified sellers with buyers through a secure online platform.</p>
        <p>We are committed to maintaining transparency, protecting user privacy, and handling personal information responsibly.</p>
      </>
    )
  },
  {
    id: "section-2",
    title: "2. Information We Collect",
    icon: FiDatabase,
    content: (
      <>
        <p className="mb-4">Depending on how you use our platform, we may collect the following information.</p>
        
        <h4 className="font-semibold text-slate-800 mb-2">Personal Information</h4>
        <ul className="list-disc list-inside mb-4 space-y-1 text-slate-600">
          <li>Full Name</li>
          <li>Email Address</li>
          <li>Phone Number</li>
          <li>Username</li>
          <li>Profile Information</li>
        </ul>

        <h4 className="font-semibold text-slate-800 mb-2">Account Information</h4>
        <ul className="list-disc list-inside mb-4 space-y-1 text-slate-600">
          <li>Login credentials</li>
          <li>Authentication details</li>
          <li>Account preferences</li>
          <li>Notification settings</li>
        </ul>

        <h4 className="font-semibold text-slate-800 mb-2">Transaction Information</h4>
        <ul className="list-disc list-inside mb-4 space-y-1 text-slate-600">
          <li>Purchase history</li>
          <li>Order information</li>
          <li>Seller listings</li>
          <li>Wallet transactions</li>
          <li>Withdrawal requests</li>
        </ul>

        <h4 className="font-semibold text-slate-800 mb-2">Seller Verification Information</h4>
        <p className="mb-2">For sellers, we may collect information necessary to verify marketplace eligibility, including:</p>
        <ul className="list-disc list-inside space-y-1 text-slate-600">
          <li>Identity information</li>
          <li>Business information (where applicable)</li>
          <li>Bank account details for withdrawals</li>
          <li>Verification documents</li>
        </ul>
      </>
    )
  },
  {
    id: "section-3",
    title: "3. Payment Information",
    icon: FiCreditCard,
    content: (
      <>
        <p className="mb-4">Payments are processed securely through trusted third-party payment service providers.</p>
        
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-4">
          <h4 className="font-semibold text-indigo-900 mb-2">StreamKart does not store:</h4>
          <ul className="list-disc list-inside space-y-1 text-indigo-700">
            <li>Debit card numbers</li>
            <li>Credit card numbers</li>
            <li>CVV</li>
            <li>Banking passwords</li>
            <li>UPI PINs</li>
          </ul>
        </div>
        
        <p>Payment providers process payment information in accordance with their own privacy and security policies.</p>
      </>
    )
  },
  {
    id: "section-4",
    title: "4. How We Use Your Information",
    icon: FiActivity,
    content: (
      <>
        <p className="mb-4">We use your information to:</p>
        <ul className="list-disc list-inside space-y-1 text-slate-600">
          <li>Create and manage user accounts</li>
          <li>Process marketplace transactions</li>
          <li>Deliver digital orders</li>
          <li>Enable buyer-seller communication</li>
          <li>Verify sellers</li>
          <li>Prevent fraud and abuse</li>
          <li>Detect suspicious activity</li>
          <li>Respond to support requests</li>
          <li>Improve platform performance</li>
          <li>Comply with legal obligations</li>
          <li>Maintain marketplace security</li>
        </ul>
      </>
    )
  },
  {
    id: "section-5",
    title: "5. Marketplace Communication",
    icon: FiMessageSquare,
    content: (
      <>
        <p className="mb-4">To ensure marketplace safety and assist with dispute resolution, communications exchanged through StreamKart may be monitored, logged, or retained in accordance with applicable laws.</p>
        
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
          <h4 className="font-semibold text-rose-900 mb-2">Users should never share:</h4>
          <ul className="list-disc list-inside space-y-1 text-rose-700">
            <li>OTPs</li>
            <li>Banking passwords</li>
            <li>Payment PINs</li>
            <li>Sensitive financial credentials</li>
          </ul>
        </div>
      </>
    )
  },
  {
    id: "section-6",
    title: "6. Cookies & Similar Technologies",
    icon: FiGlobe,
    content: (
      <>
        <p className="mb-4">We use cookies and similar technologies to:</p>
        <ul className="list-disc list-inside mb-4 space-y-1 text-slate-600">
          <li>Keep users signed in</li>
          <li>Improve website functionality</li>
          <li>Remember preferences</li>
          <li>Analyze platform performance</li>
          <li>Enhance user experience</li>
        </ul>
        <p>Users may manage cookie preferences through their browser settings.</p>
      </>
    )
  },
  {
    id: "section-7",
    title: "7. Data Sharing",
    icon: FiShare2,
    content: (
      <>
        <p className="font-medium text-slate-800 mb-4">We do not sell, rent, or trade personal information.</p>
        <p className="mb-4">Information may only be shared with:</p>
        <ul className="list-disc list-inside space-y-1 text-slate-600">
          <li>Payment service providers</li>
          <li>Identity verification providers</li>
          <li>Technology service providers</li>
          <li>Legal authorities where required by law</li>
          <li>Fraud prevention partners</li>
          <li>Regulatory authorities when legally required</li>
        </ul>
      </>
    )
  },
  {
    id: "section-8",
    title: "8. Data Security",
    icon: FiShield,
    content: (
      <>
        <p className="mb-4">We implement industry-standard security practices designed to protect user information, including:</p>
        <ul className="list-disc list-inside mb-4 space-y-1 text-slate-600">
          <li>Secure encrypted connections (HTTPS)</li>
          <li>Access controls</li>
          <li>Authentication mechanisms</li>
          <li>Database security</li>
          <li>Activity monitoring</li>
          <li>Infrastructure security</li>
        </ul>
        <p>Although we strive to protect user information, no internet transmission or storage system can be guaranteed to be completely secure.</p>
      </>
    )
  },
  {
    id: "section-9",
    title: "9. Data Retention",
    icon: FiArchive,
    content: (
      <>
        <p className="mb-4">We retain information only for as long as necessary to:</p>
        <ul className="list-disc list-inside mb-4 space-y-1 text-slate-600">
          <li>Provide our services</li>
          <li>Fulfill legal obligations</li>
          <li>Resolve disputes</li>
          <li>Prevent fraud</li>
          <li>Enforce marketplace policies</li>
        </ul>
        <p>When information is no longer required, it is securely deleted or anonymized where appropriate.</p>
      </>
    )
  },
  {
    id: "section-10",
    title: "10. User Rights",
    icon: FiUserCheck,
    content: (
      <>
        <p className="mb-4">Depending on applicable law, users may have the right to:</p>
        <ul className="list-disc list-inside mb-4 space-y-1 text-slate-600">
          <li>Access their personal information</li>
          <li>Update account information</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of eligible information</li>
          <li>Manage communication preferences</li>
          <li>Close their account</li>
        </ul>
        <p>Certain information may continue to be retained where required by law or for legitimate business purposes.</p>
      </>
    )
  },
  {
    id: "section-11",
    title: "11. Third-Party Services",
    icon: FiLink,
    content: (
      <>
        <p className="mb-4">Our platform may integrate with trusted third-party services including payment providers, authentication providers, analytics providers, or communication services.</p>
        <p className="mb-4">These third parties operate under their own privacy policies.</p>
        <p>We encourage users to review the privacy policies of any third-party services they interact with.</p>
      </>
    )
  },
  {
    id: "section-12",
    title: "12. Children's Privacy",
    icon: FiUsers,
    content: (
      <>
        <p className="mb-4">StreamKart is not intended for individuals who are not legally permitted to enter into binding agreements under applicable law.</p>
        <p>If we become aware that personal information has been collected contrary to applicable requirements, we will take appropriate steps to remove such information.</p>
      </>
    )
  },
  {
    id: "section-13",
    title: "13. Policy Updates",
    icon: FiRefreshCw,
    content: (
      <>
        <p className="mb-4">We may update this Privacy Policy from time to time to reflect legal, operational, or platform changes.</p>
        <p className="mb-4">Updated versions will be published on this page with the revised Effective Date.</p>
        <p>Continued use of StreamKart after changes become effective constitutes acceptance of the updated Privacy Policy.</p>
      </>
    )
  },
  {
    id: "section-14",
    title: "14. Contact Us",
    icon: FiMail,
    content: (
      <>
        <p className="mb-4">If you have any questions regarding this Privacy Policy or how your information is handled, please contact us.</p>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="font-semibold text-slate-800">Email:</p>
          <a href="mailto:creativecornerpass@gmail.com" className="text-indigo-600 hover:underline mb-4 block">creativecornerpass@gmail.com</a>
          
          <p className="font-semibold text-slate-800">Website:</p>
          <a href="https://streamkart.in" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">https://streamkart.in</a>
        </div>
      </>
    )
  }
];

// Reusable animated section card
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

  const Icon = section.icon;

  return (
    <motion.section
      id={section.id}
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="scroll-mt-32 mb-10"
    >
      <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_4px_20px_rgba(15,23,42,0.03)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(99,102,241,0.06)] transition-shadow duration-500">
        
        {/* Subtle decorative background icon */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none transform translate-x-4 -translate-y-4">
          <Icon className="w-48 h-48 text-slate-900" />
        </div>

        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">{section.title}</h2>
        </div>
        <div className="text-slate-600 leading-relaxed relative z-10 text-[17px]">
          {section.content}
        </div>
      </div>
    </motion.section>
  );
};

const Privacy = () => {
  const [activeSection, setActiveSection] = useState(privacySections[0].id);
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Reading Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-indigo-600 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <header className="relative bg-white border-b border-slate-100 pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white opacity-60"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-sm font-medium mb-8"
          >
            <FiGlobe className="w-4 h-4 text-indigo-500" />
            Global Legal Policy
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6"
          >
            Privacy Policy
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Learn how StreamKart collects, uses, stores, protects, and manages your personal information while providing a secure marketplace experience.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-8 text-sm text-slate-500"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-xs">Effective Date</span>
              <span>{currentDate}</span>
            </div>
            <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-xs">Last Updated</span>
              <span>{currentDate}</span>
            </div>
            <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-xs">Estimated Reading Time</span>
              <span>10 min read</span>
            </div>
          </motion.div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 flex flex-col lg:flex-row gap-12 relative">
        
        {/* Sticky Sidebar Navigation (Desktop) */}
        <aside className="w-full lg:w-72 shrink-0 hidden lg:block">
          <div className="sticky top-28 bg-white/50 backdrop-blur-xl border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 tracking-tight">Table of Contents</h3>
            <nav className="flex flex-col space-y-1">
              {privacySections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => handleNavClick(e, section.id)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === section.id 
                      ? "bg-indigo-50 text-indigo-700 shadow-[inset_2px_0_0_0_#4f46e5]" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile Navigation Dropdown (Optional fallback) */}
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
            {privacySections.map(section => (
              <option key={section.id} value={section.id}>{section.title}</option>
            ))}
          </select>
        </div>

        {/* Content Area */}
        <main className="flex-1 max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-10 p-6 bg-white rounded-2xl border border-slate-100 text-slate-600 leading-relaxed shadow-sm"
          >
            <p className="mb-4">Welcome to StreamKart. Protecting your privacy is one of our highest priorities. This Privacy Policy explains how we collect, use, store, process, and safeguard your personal information when you access or use the StreamKart platform.</p>
            <p className="font-medium text-slate-800">By creating an account or using our services, you acknowledge that you have read and understood this Privacy Policy.</p>
          </motion.div>

          <div className="space-y-6">
            {privacySections.map((section) => (
              <PolicySection 
                key={section.id} 
                section={section} 
                setActiveSection={setActiveSection} 
              />
            ))}
          </div>
        </main>

      </div>
    </div>
  );
};

export default Privacy;
