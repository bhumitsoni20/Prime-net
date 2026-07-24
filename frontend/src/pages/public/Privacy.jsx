import { motion } from 'framer-motion';
import { HiShieldCheck, HiOutlineLockClosed, HiOutlineCreditCard, HiOutlineMail, HiOutlineDatabase, HiOutlineUserGroup, HiOutlineShieldExclamation, HiOutlineDocumentText } from 'react-icons/hi';
import { HiOutlineDocumentSearch } from 'react-icons/hi';

const Privacy = () => {
  const sections = [
    {
      id: 1,
      title: 'Information We Collect',
      icon: HiOutlineDocumentText,
      content: (
        <ul className="space-y-2 text-[#64748B] list-disc list-inside">
          <li>Name</li>
          <li>Email address</li>
          <li>Contact details</li>
          <li>Transaction and order history</li>
          <li>Payment details (where applicable through secure payment providers)</li>
          <li>Verification or compliance-related information (if required)</li>
        </ul>
      )
    },
    {
      id: 2,
      title: 'Payment Information',
      icon: HiOutlineCreditCard,
      content: (
        <ul className="space-y-2 text-[#64748B] list-disc list-inside">
          <li>All payments are processed securely through trusted third-party payment gateways.</li>
          <li>STREAM KART does not store sensitive financial data such as card numbers or banking credentials.</li>
        </ul>
      )
    },
    {
      id: 3,
      title: 'How We Use Your Information',
      icon: HiOutlineDatabase,
      content: (
        <>
          <ul className="space-y-2 text-[#64748B] list-disc list-inside mb-4">
            <li>Process orders and transactions</li>
            <li>Deliver digital products and services</li>
            <li>Provide customer support</li>
            <li>Prevent fraud</li>
            <li>Improve platform functionality</li>
          </ul>
          <p className="text-[#0F172A] font-medium">We do not sell, rent, or trade personal information.</p>
        </>
      )
    },
    {
      id: 4,
      title: 'Data Sharing & Disclosure',
      icon: HiOutlineUserGroup,
      content: <p className="text-[#64748B]">Shared only with payment providers, where legally required, or for fraud prevention.</p>
    },
    {
      id: 5,
      title: 'Communication Security',
      icon: HiOutlineMail,
      content: <p className="text-[#64748B]">Never share passwords or OTPs. Communications may be monitored for security.</p>
    },
    {
      id: 6,
      title: 'Data Protection & Security',
      icon: HiShieldCheck,
      content: <p className="text-[#64748B]">Secure servers, encrypted transmission, and restricted access controls.</p>
    },
    {
      id: 7,
      title: 'Cookies & Tracking',
      icon: HiOutlineDocumentSearch,
      content: <p className="text-[#64748B]">Used to improve functionality and user experience.</p>
    },
    {
      id: 8,
      title: 'User Rights',
      icon: HiOutlineLockClosed,
      content: <p className="text-[#64748B]">Users may update information, request deletion, and manage communication preferences.</p>
    },
    {
      id: 9,
      title: 'Data Retention',
      icon: HiOutlineShieldExclamation,
      content: <p className="text-[#64748B]">Data is retained only as necessary for legal and operational purposes.</p>
    },
    {
      id: 10,
      title: 'Policy Updates',
      icon: HiOutlineDocumentText,
      content: <p className="text-[#64748B]">STREAM KART may update this policy at any time.</p>
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
            <HiShieldCheck className="w-10 h-10 text-[#5B4BFF]" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[42px] sm:text-[56px] font-extrabold text-white mb-6 tracking-tight leading-tight"
          >
            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#5B4BFF]">Policy</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[#94A3B8] text-[16px] max-w-2xl mx-auto leading-relaxed"
          >
            At STREAM KART, your privacy is important to us. This Privacy Policy explains how we collect, use, store, and protect your personal information when you access or use our platform. By using STREAM KART, you agree to the practices described in this policy.
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
                transition={{ duration: 0.4, delay: index * 0.05 }}
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

export default Privacy;
