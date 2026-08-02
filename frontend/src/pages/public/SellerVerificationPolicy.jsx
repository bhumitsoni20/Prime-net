import { motion } from 'framer-motion';
import { HiOutlineBadgeCheck, HiOutlineCheckCircle, HiOutlineUserAdd, HiOutlineShieldExclamation, HiOutlineExclamationCircle, HiOutlineRefresh } from 'react-icons/hi';

const SellerVerificationPolicy = () => {
  const sections = [
    {
      id: 1,
      title: '1. Eligibility',
      icon: HiOutlineCheckCircle,
      content: (
        <>
          <p className="text-[#64748B] mb-4">To register as a seller, applicants must provide:</p>
          <ul className="space-y-2 text-[#64748B] list-disc list-inside">
            <li>A valid Gmail account.</li>
            <li>A valid and active WhatsApp mobile number.</li>
            <li>Accurate registration information.</li>
            <li>Acceptance of Stream Kart's Terms & Conditions and Seller Policy.</li>
          </ul>
        </>
      )
    },
    {
      id: 2,
      title: '2. Verification Process',
      icon: HiOutlineUserAdd,
      content: (
        <ul className="space-y-2 text-[#64748B] list-disc list-inside">
          <li>The seller submits their Gmail address and WhatsApp number during registration.</li>
          <li>The Stream Kart Admin Team manually reviews each seller application.</li>
          <li>The Admin may contact the seller through the registered Gmail address or WhatsApp number to verify the submitted information or request additional details if necessary.</li>
          <li>Once the verification is successfully completed, the seller account will be approved and activated for selling on Stream Kart.</li>
        </ul>
      )
    },
    {
      id: 3,
      title: '3. Approval Rights',
      icon: HiOutlineShieldExclamation,
      content: (
        <>
          <p className="text-[#64748B] mb-4">Stream Kart reserves the right to approve, reject, suspend, or terminate any seller account at its sole discretion if:</p>
          <ul className="space-y-2 text-[#64748B] list-disc list-inside">
            <li>Incorrect or misleading information is provided.</li>
            <li>The seller fails to respond to verification requests.</li>
            <li>The seller violates Stream Kart's policies or applicable laws.</li>
            <li>Fraudulent, suspicious, or unauthorized activities are detected.</li>
          </ul>
        </>
      )
    },
    {
      id: 4,
      title: '4. Seller Responsibility',
      icon: HiOutlineExclamationCircle,
      content: (
        <p className="text-[#64748B]">
          Sellers are responsible for maintaining access to their registered Gmail account and WhatsApp number. Any changes to these details should be promptly communicated to Stream Kart. Stream Kart is not responsible for issues resulting from inaccessible or outdated contact information.
        </p>
      )
    },
    {
      id: 5,
      title: '5. Policy Updates',
      icon: HiOutlineRefresh,
      content: (
        <p className="text-[#64748B]">
          Stream Kart reserves the right to modify this Seller Verification Policy at any time. Continued use of the seller account after any changes constitutes acceptance of the updated policy.
        </p>
      )
    }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center p-3 bg-[#5B4BFF]/10 rounded-2xl mb-6"
          >
            <HiOutlineBadgeCheck className="w-8 h-8 text-[#5B4BFF]" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight mb-6"
          >
            Seller Verification Policy
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed"
          >
            To ensure a secure and trustworthy marketplace, every seller must complete the seller verification process before being permitted to list or sell products on Stream Kart.
          </motion.p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div 
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-6">
                <div className="p-4 bg-[#F1F5F9] rounded-2xl text-[#5B4BFF] shrink-0">
                  <section.icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#0F172A] mb-4">
                    {section.title}
                  </h3>
                  <div className="prose prose-slate max-w-none text-[#64748B] leading-relaxed">
                    {section.content}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-[#94A3B8] text-sm">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default SellerVerificationPolicy;
