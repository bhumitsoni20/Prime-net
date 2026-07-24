import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { HiCurrencyDollar, HiShieldCheck, HiShoppingBag, HiSearch, HiPaperClip, HiChatAlt2, HiMail, HiOutlineClock } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Contact = () => {
  const [form, setForm] = useState({ topic: '', subject: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success('Ticket submitted! We\'ll get back to you soon.');
      setForm({ topic: '', subject: '', description: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  const topicCards = [
    { icon: HiCurrencyDollar, title: 'Payments & Billing', desc: 'Invoices, Refunds, Payment Methods', color: 'from-[#5B4BFF] to-[#7C3AED]', bg: 'bg-[#EEF2FF]' },
    { icon: HiShieldCheck, title: 'Account & Security', desc: 'Login Issues, Profile Settings, 2FA', color: 'from-[#22C55E] to-[#16A34A]', bg: 'bg-[#F0FDF4]' },
    { icon: HiShoppingBag, title: 'Seller Center', desc: 'Listing, Payouts, Policies', color: 'from-[#F59E0B] to-[#D97706]', bg: 'bg-[#FFFBEB]' },
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
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[42px] sm:text-[56px] font-extrabold text-white mb-6 tracking-tight leading-tight"
          >
            How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#5B4BFF]">help you?</span>
          </motion.h1>

          {/* Search */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative max-w-xl mx-auto mb-6 group"
          >
            <input
              type="text"
              placeholder="Search our knowledge base..."
              className="w-full bg-white/5 border border-white/10 rounded-[20px] pl-6 pr-16 py-5 text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#5B4BFF]/50 focus:border-[#5B4BFF]/50 shadow-2xl text-[16px] backdrop-blur-md transition-all"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-[14px] bg-[#5B4BFF] hover:bg-[#4F3FE8] flex items-center justify-center transition-all shadow-[0_4px_14px_rgba(91,75,255,0.3)] hover:shadow-[0_6px_20px_rgba(91,75,255,0.4)]">
              <HiSearch className="w-5 h-5 text-white" />
            </button>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#94A3B8] text-[15px]"
          >
            Browse our Knowledge Base or contact our support team.
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        {/* Topic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {topicCards.map((t, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (index * 0.1) }}
              key={t.title} 
              className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className={`h-16 w-16 rounded-[18px] bg-gradient-to-br ${t.color} flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                <t.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-[#0F172A] font-extrabold text-[18px] mb-2">{t.title}</h3>
              <p className="text-[#64748B] text-[14px] leading-relaxed">{t.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Contact Form Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Form */}
          <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-[32px] p-8 sm:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <h2 className="text-[24px] font-extrabold text-[#0F172A] mb-8 tracking-[-0.01em]">Still need help? Send a ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-[0.08em]">Choose a Topic</label>
                  <div className="relative">
                    <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] px-5 py-3.5 text-[#0F172A] focus:outline-none focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white appearance-none transition-all font-medium">
                      <option value="">Select Topic</option>
                      <option>Payments & Billing</option>
                      <option>Account & Security</option>
                      <option>Seller Center</option>
                      <option>Technical Issue</option>
                      <option>Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#64748B]">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                    </div>
                  </div>
                </div>
                <Input label="Subject" placeholder="Brief subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required className="bg-[#F8FAFC] border-[#E2E8F0] focus:bg-white" />
              </div>
              
              <div>
                <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-[0.08em]">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={6}
                  placeholder="Please describe your issue in detail..."
                  required
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] px-5 py-4 text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white transition-all resize-none"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#F1F5F9]">
                <Button variant="outline" type="button" className="w-full sm:w-auto border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]">
                  <HiPaperClip className="w-[18px] h-[18px] mr-2" /> Attach Files
                </Button>
                <Button type="submit" size="lg" className="w-full sm:w-auto shadow-[0_4px_14px_rgba(91,75,255,0.3)] px-10" loading={isSubmitting}>
                  Submit Ticket
                </Button>
              </div>
            </form>
          </div>

          {/* Right side info cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="w-12 h-12 rounded-[14px] bg-[#EEF2FF] text-[#5B4BFF] flex items-center justify-center mb-6">
                <HiMail className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-[#0F172A] text-[18px] mb-2">Email Support</h3>
              <p className="text-[#64748B] text-[14px] mb-6 leading-relaxed">Prefer to email us directly? We're here to help.</p>
              <a href="mailto:support@streamkart.com" className="inline-flex text-[#5B4BFF] font-bold text-[15px] hover:text-[#4F3FE8] transition-colors">
                support@streamkart.com
              </a>
            </div>

            <div className="bg-[#0F172A] rounded-[32px] p-8 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#5B4BFF]/20 rounded-full blur-[40px] group-hover:bg-[#5B4BFF]/30 transition-colors" />
              <div className="w-12 h-12 rounded-[14px] bg-white/10 text-white flex items-center justify-center mb-6 relative z-10 backdrop-blur-sm">
                <HiChatAlt2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-[18px] mb-2 relative z-10">Live Chat</h3>
              <p className="text-[#94A3B8] text-[14px] mb-6 leading-relaxed relative z-10">Chat directly with our support team for immediate assistance.</p>
              <Button variant="secondary" className="w-full relative z-10 border-none font-bold text-[#0F172A] hover:bg-gray-50">
                Start Chat
              </Button>
            </div>
            
            <div className="flex items-center gap-3 px-2">
              <HiOutlineClock className="w-5 h-5 text-[#94A3B8]" />
              <span className="text-[#64748B] text-[13px] font-medium">Average response time: <strong>under 20 minutes</strong></span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
