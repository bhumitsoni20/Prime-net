import { motion } from 'framer-motion';
import { HiOutlineRefresh, HiOutlineDesktopComputer, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlinePhone } from 'react-icons/hi';

const RefundPolicy = () => {
  const sections = [
    {
      id: 1,
      title: 'Digital Products',
      icon: HiOutlineDesktopComputer,
      content: (
        <p className="text-[#64748B]">
          All products sold on Stream Kart are digital subscription services. Since digital products are delivered electronically and become accessible immediately after purchase, refunds are limited.
        </p>
      )
    },
    {
      id: 2,
      title: 'Eligible Refunds',
      icon: HiOutlineCheckCircle,
      content: (
        <ul className="space-y-2 text-[#64748B] list-disc list-inside">
          <li>The subscription could not be delivered due to a technical issue from our end.</li>
          <li>You were charged more than once for the same order.</li>
          <li>The wrong subscription plan was delivered and cannot be corrected.</li>
          <li>The order cannot be fulfilled within the promised delivery time.</li>
        </ul>
      )
    },
    {
      id: 3,
      title: 'Non-Refundable Situations',
      icon: HiOutlineXCircle,
      content: (
        <>
          <p className="text-[#64748B] mb-4">Refunds will not be provided if:</p>
          <ul className="space-y-2 text-[#64748B] list-disc list-inside">
            <li>The subscription has already been successfully delivered and activated.</li>
            <li>You purchased the wrong plan or entered incorrect account details.</li>
            <li>You change your mind after delivery.</li>
            <li>The OTT platform changes its pricing, features, or terms after purchase.</li>
            <li>The subscription is suspended or terminated due to violation of the OTT platform's terms of service.</li>
          </ul>
        </>
      )
    },
    {
      id: 4,
      title: 'Refund Process',
      icon: HiOutlineRefresh,
      content: (
        <>
          <p className="text-[#64748B] mb-4">To request a refund, contact our customer support with:</p>
          <ul className="space-y-2 text-[#64748B] list-disc list-inside mb-4">
            <li>Order ID</li>
            <li>Registered email address</li>
            <li>Reason for the refund request</li>
          </ul>
          <p className="text-[#64748B]">
            Eligible refunds are generally processed within 5–7 business days after approval and are credited to the original payment method.
          </p>
        </>
      )
    },
    {
      id: 5,
      title: 'Contact',
      icon: HiOutlinePhone,
      content: (
        <p className="text-[#64748B]">
          For refund-related queries, please contact Stream Kart customer support through the contact details provided on our website.
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
            <HiOutlineRefresh className="w-8 h-8 text-[#5B4BFF]" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight mb-6"
          >
            Refund Policy
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed"
          >
            Welcome to Stream Kart. We are committed to providing a smooth and transparent experience for purchasing digital OTT subscriptions. Please read our refund policy carefully before placing an order.
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

export default RefundPolicy;
