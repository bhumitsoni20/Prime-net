import { motion } from 'framer-motion';
import { HiOutlineUserGroup, HiOutlineShieldExclamation, HiOutlineDocumentText, HiOutlineCreditCard, HiOutlineBan, HiOutlineScale } from 'react-icons/hi';

const SellerPolicy = () => {
  const sections = [
    {
      id: 1,
      title: 'Seller Responsibilities',
      icon: HiOutlineUserGroup,
      content: (
        <>
          <p className="text-[#64748B] mb-4">All sellers must:</p>
          <ul className="space-y-2 text-[#64748B] list-disc list-inside">
            <li>Provide genuine and legally obtained OTT subscriptions.</li>
            <li>Ensure accurate product descriptions and pricing.</li>
            <li>Deliver subscriptions within the committed time.</li>
            <li>Respond promptly to customer queries.</li>
            <li>Comply with applicable laws and the terms of the OTT platforms.</li>
          </ul>
        </>
      )
    },
    {
      id: 2,
      title: 'Prohibited Activities',
      icon: HiOutlineBan,
      content: (
        <>
          <p className="text-[#64748B] mb-4">Sellers must not:</p>
          <ul className="space-y-2 text-[#64748B] list-disc list-inside">
            <li>Sell unauthorized, hacked, stolen, or illegally obtained subscriptions.</li>
            <li>Misrepresent subscription validity or features.</li>
            <li>Engage in fraudulent transactions.</li>
            <li>Share customer information without authorization.</li>
          </ul>
        </>
      )
    },
    {
      id: 3,
      title: 'Order Fulfillment',
      icon: HiOutlineDocumentText,
      content: (
        <>
          <p className="text-[#64748B] mb-4">Sellers are responsible for:</p>
          <ul className="space-y-2 text-[#64748B] list-disc list-inside">
            <li>Timely delivery of purchased subscriptions.</li>
            <li>Providing correct activation details.</li>
            <li>Resolving delivery-related issues promptly.</li>
          </ul>
        </>
      )
    },
    {
      id: 4,
      title: 'Payments',
      icon: HiOutlineCreditCard,
      content: (
        <p className="text-[#64748B]">
          Payments to sellers will be processed according to the settlement schedule determined by Stream Kart, subject to successful order completion and verification.
        </p>
      )
    },
    {
      id: 5,
      title: 'Account Suspension',
      icon: HiOutlineShieldExclamation,
      content: (
        <>
          <p className="text-[#64748B] mb-4">Stream Kart reserves the right to suspend or permanently terminate a seller account for:</p>
          <ul className="space-y-2 text-[#64748B] list-disc list-inside">
            <li>Fraudulent activity</li>
            <li>Repeated customer complaints</li>
            <li>Selling unauthorized subscriptions</li>
            <li>Violation of applicable laws or this Seller Policy</li>
          </ul>
        </>
      )
    },
    {
      id: 6,
      title: 'Liability',
      icon: HiOutlineScale,
      content: (
        <p className="text-[#64748B]">
          Sellers are solely responsible for the legality and authenticity of the subscriptions they offer on Stream Kart.
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
            <HiOutlineUserGroup className="w-8 h-8 text-[#5B4BFF]" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight mb-6"
          >
            Seller Policy
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed"
          >
            The Seller Policy governs individuals and businesses that sell digital OTT subscriptions through Stream Kart.
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

export default SellerPolicy;
