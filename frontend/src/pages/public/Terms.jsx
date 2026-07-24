import { motion } from 'framer-motion';
import { 
  HiOutlineUser, HiOutlineGlobeAlt, HiOutlineTag, HiOutlineShoppingCart, 
  HiOutlineClipboardList, HiOutlineCreditCard, HiOutlineRefresh, HiOutlineChat, 
  HiOutlineShieldCheck, HiOutlineBan, HiOutlineLockClosed, HiOutlineExclamationCircle, 
  HiOutlineSparkles, HiOutlineScale, HiOutlineLibrary, HiOutlineDocumentText
} from 'react-icons/hi';

const Terms = () => {
  const sections = [
    {
      id: 1,
      title: 'Eligibility & Account Responsibility',
      icon: HiOutlineUser,
      content: <p className="text-[#64748B]">Users must be 18+ and provide accurate information.</p>
    },
    {
      id: 2,
      title: 'Nature of the Platform',
      icon: HiOutlineGlobeAlt,
      content: <p className="text-[#64748B]">STREAM KART operates as a C2C digital marketplace facilitator.</p>
    },
    {
      id: 3,
      title: 'Seat Providers',
      icon: HiOutlineTag,
      content: <p className="text-[#64748B]">Only legally purchased unused seats may be listed.</p>
    },
    {
      id: 4,
      title: 'Buyers',
      icon: HiOutlineShoppingCart,
      content: <p className="text-[#64748B]">Buyers receive temporary access only.</p>
    },
    {
      id: 5,
      title: 'Listing Policy',
      icon: HiOutlineClipboardList,
      content: <p className="text-[#64748B]">Listings may be reordered or removed.</p>
    },
    {
      id: 6,
      title: 'Payments & Withdrawals',
      icon: HiOutlineCreditCard,
      content: (
        <>
          <p className="text-[#64748B] mb-3">Payments via third-party gateways.</p>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] p-5">
            <h4 className="font-bold text-[#0F172A] mb-3 text-[13px] uppercase tracking-[0.08em]">Platform fees:</h4>
            <ul className="space-y-2 text-[#64748B] text-[14px]">
              <li className="flex justify-between items-center"><span className="font-medium">7d – 45d</span><span className="font-bold text-[#5B4BFF]">20%</span></li>
              <li className="flex justify-between items-center"><span className="font-medium">3 months</span><span className="font-bold text-[#5B4BFF]">25%</span></li>
              <li className="flex justify-between items-center"><span className="font-medium">6 months – 1 year</span><span className="font-bold text-[#5B4BFF]">30%</span></li>
            </ul>
          </div>
        </>
      )
    },
    {
      id: 7,
      title: 'Refund Policy',
      icon: HiOutlineRefresh,
      content: (
        <ul className="space-y-2 text-[#64748B] list-disc list-inside">
          <li>Refund for non-delivery, wrong or non-working access.</li>
          <li>No refund for misuse, working access, or issues after 24 hours.</li>
        </ul>
      )
    },
    {
      id: 8,
      title: 'Communication Rules',
      icon: HiOutlineChat,
      content: <p className="text-[#64748B]">Use official platform communication only.</p>
    },
    {
      id: 9,
      title: 'Privacy',
      icon: HiOutlineShieldCheck,
      content: <p className="text-[#64748B]">User information is protected.</p>
    },
    {
      id: 10,
      title: 'Prohibited Activities',
      icon: HiOutlineBan,
      content: <p className="text-[#64748B]">Fraud, fake listings, abuse, policy violations.</p>
    },
    {
      id: 11,
      title: 'Suspension',
      icon: HiOutlineLockClosed,
      content: <p className="text-[#64748B]">Accounts may be suspended or terminated.</p>
    },
    {
      id: 12,
      title: 'Brand Disclaimer',
      icon: HiOutlineExclamationCircle,
      content: <p className="text-[#64748B]">STREAM KART is not affiliated with third-party brands.</p>
    },
    {
      id: 13,
      title: 'Platform Updates',
      icon: HiOutlineSparkles,
      content: <p className="text-[#64748B]">Policies may change.</p>
    },
    {
      id: 14,
      title: 'Limitation of Liability',
      icon: HiOutlineScale,
      content: <p className="text-[#64748B]">Liability is limited to the extent permitted by law.</p>
    },
    {
      id: 15,
      title: 'Governing Law',
      icon: HiOutlineLibrary,
      content: <p className="text-[#64748B]">Governed by the laws of India.</p>
    }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      {/* Hero Banner */}
      <div className="relative bg-[#0F172A] overflow-hidden pt-24 pb-32 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Background Gradients */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#5B4BFF]/20 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#7C3AED]/20 blur-[100px] pointer-events-none" />
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-[#5B4BFF]/10 to-[#7C3AED]/10 rounded-[20px] flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(91,75,255,0.2)] backdrop-blur-sm border border-white/10"
          >
            <HiOutlineDocumentText className="w-10 h-10 text-[#5B4BFF]" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[42px] sm:text-[56px] font-extrabold text-white mb-6 tracking-tight leading-tight"
          >
            Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#5B4BFF]">Conditions</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[#94A3B8] text-[16px] max-w-2xl mx-auto leading-relaxed"
          >
            Welcome to STREAM KART. By using this platform you agree to these Terms & Conditions.
          </motion.p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-[#E2E8F0] rounded-[32px] p-8 sm:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
        >
          <div className="space-y-12">
            {sections.map((section, index) => (
              <motion.div 
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                className="group"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center flex-shrink-0 group-hover:bg-[#EEF2FF] group-hover:border-[#C7D2FE] group-hover:text-[#5B4BFF] transition-colors duration-300">
                    <section.icon className="w-6 h-6 text-[#94A3B8] group-hover:text-[#5B4BFF] transition-colors duration-300" />
                  </div>
                  <div className="flex-1 pt-2">
                    <h2 className="text-[20px] font-bold text-[#0F172A] mb-4 tracking-tight flex items-center gap-3">
                      <span className="text-[#5B4BFF] text-[16px]">{section.id}.</span> 
                      {section.title}
                    </h2>
                    <div className="text-[15px] leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                </div>
                {index !== sections.length - 1 && (
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E2E8F0] to-transparent mt-12" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <div className="mt-12 text-center text-[#94A3B8] text-[14px]">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
