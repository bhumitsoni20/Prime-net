import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  HiSparkles, 
  HiLightningBolt, 
  HiShieldCheck, 
  HiCheckCircle, 
  HiPaperAirplane, 
  HiClock, 
  HiTag, 
  HiLink, 
  HiDocumentText,
  HiFilm,
  HiPuzzle,
  HiAcademicCap,
  HiCloud,
  HiMusicNote,
  HiCog,
  HiCollection,
  HiQuestionMarkCircle
} from 'react-icons/hi';
import Button from '../../components/ui/Button';
import { apiPost } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { DotGridBackground, ShinyText, SpotlightCard } from '../../components/reactbits';

const categories = [
  { value: 'ott', label: 'OTT Platforms', icon: HiFilm, bg: 'bg-indigo-50', text: 'text-[#5B4BFF]' },
  { value: 'ai-tools', label: 'AI & Productivity', icon: HiLightningBolt, bg: 'bg-blue-50', text: 'text-blue-600' },
  { value: 'vpn', label: 'VPN & Security', icon: HiShieldCheck, bg: 'bg-cyan-50', text: 'text-cyan-600' },
  { value: 'gaming', label: 'Games & Accounts', icon: HiPuzzle, bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { value: 'education', label: 'Education & Learning', icon: HiAcademicCap, bg: 'bg-amber-50', text: 'text-amber-600' },
  { value: 'software', label: 'Software & Tools', icon: HiCog, bg: 'bg-violet-50', text: 'text-violet-600' },
  { value: 'cloud-storage', label: 'Cloud & Storage', icon: HiCloud, bg: 'bg-slate-100', text: 'text-slate-600' },
  { value: 'music', label: 'Music & Audio', icon: HiMusicNote, bg: 'bg-pink-50', text: 'text-pink-600' },
  { value: 'other', label: 'Other / Custom', icon: HiCollection, bg: 'bg-purple-50', text: 'text-purple-600' },
];

const priorityOptions = [
  { value: 'High', label: 'Urgent', sub: 'Need within 24 hours', badge: '⚡ High', activeColor: 'border-[#5B4BFF] bg-[#F3F1FF] text-[#5B4BFF]' },
  { value: 'Medium', label: 'Standard', sub: 'Looking for 2-3 days', badge: '🔥 Standard', activeColor: 'border-[#5B4BFF] bg-[#F3F1FF] text-[#5B4BFF]' },
  { value: 'Low', label: 'Flexible', sub: 'Prioritizing best price', badge: '💡 Flexible', activeColor: 'border-[#5B4BFF] bg-[#F3F1FF] text-[#5B4BFF]' },
];

const recentFulfilled = [
  { name: 'ChatGPT Plus 1-Month', time: '18m ago', price: '₹750' },
  { name: 'NordVPN 2-Year Ultimate', time: '42m ago', price: '₹1,200' },
  { name: 'Canva Pro Annual Pass', time: '2h ago', price: '₹499' },
  { name: 'Coursera Plus 6-Months', time: '3h ago', price: '₹899' },
];

const RequestProduct = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'ott',
    description: '',
    priority: 'Medium',
    duration: '1',
    referenceUrl: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategorySelect = (val) => {
    setFormData({ ...formData, category: val });
  };

  const handlePrioritySelect = (val) => {
    setFormData({ ...formData, priority: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to request a product');
      navigate('/login?redirect=/request-product');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter the product or service name');
      return;
    }

    try {
      setLoading(true);
      await apiPost('/requests', {
        ...formData,
        duration: formData.duration ? Number(formData.duration) : undefined,
      });
      toast.success('Product request submitted successfully!');
      navigate('/dashboard/my-requests');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAFBFF] pt-28 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Ambience */}
      <DotGridBackground opacity={0.3} spacing={32} dotColor="#C7D2FE" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#5B4BFF]/[0.07] via-[#A855F7]/[0.04] to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Header Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md text-[#5B4BFF] border border-[#5B4BFF]/25 rounded-full px-4 py-1.5 text-xs font-extrabold mb-4 shadow-[0_4px_16px_rgba(91,75,255,0.08)]">
            <HiSparkles className="w-4 h-4 text-[#A855F7]" />
            <span>VIP Sourcing Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-[-0.035em] mb-4">
            Request a <ShinyText text="Custom Product" speed={3.5} />
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Can't find the exact subscription, tool, or credential pass you need? Post your requirement and verified sellers will activate it for you.
          </p>

          {/* Social Proof Tags */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
              <HiClock className="w-4 h-4 text-[#5B4BFF]" />
              Avg. Response: &lt; 4 Hours
            </span>
            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
              <HiShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Escrow Protection
            </span>
            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
              <HiCheckCircle className="w-4 h-4 text-amber-500" />
              99.2% Fulfillment Rate
            </span>
          </div>
        </motion.div>

        {/* 3 Step Interactive Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          <SpotlightCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#5B4BFF] flex items-center justify-center font-black text-base flex-shrink-0 shadow-xs">
                01
              </div>
              <div>
                <h4 className="text-[15px] font-extrabold text-[#0F172A] mb-1">Specify Details</h4>
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  Enter the service name, plan duration, and device specifications.
                </p>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-[#7C3AED] flex items-center justify-center font-black text-base flex-shrink-0 shadow-xs">
                02
              </div>
              <div>
                <h4 className="text-[15px] font-extrabold text-[#0F172A] mb-1">Sellers Compete</h4>
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  Verified sellers check stock and provide the most competitive prices.
                </p>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-black text-base flex-shrink-0 shadow-xs">
                03
              </div>
              <div>
                <h4 className="text-[15px] font-extrabold text-[#0F172A] mb-1">Claim Your Pass</h4>
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  Get notified instantly and purchase securely via 1-click checkout.
                </p>
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* 2-Column Main Section: Request Form + Live Benefits Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form (8 Columns) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(91,75,255,0.08)] border border-slate-200/90 p-6 sm:p-10 relative overflow-hidden"
          >
            {/* Top decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5B4BFF] via-[#A855F7] to-[#3B82F6]" />

            <form onSubmit={handleSubmit} className="space-y-7">
              
              {/* Product Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-extrabold text-[#0F172A] mb-2 flex items-center gap-1.5">
                  <HiTag className="w-4 h-4 text-[#5B4BFF]" />
                  <span>Product or Service Name *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-[16px] bg-[#F8FAFC] border border-slate-200 focus:bg-white focus:ring-[3px] focus:ring-[#5B4BFF]/15 focus:border-[#5B4BFF] transition-all outline-none text-slate-900 font-semibold text-sm placeholder-slate-400"
                  placeholder="e.g. Adobe Creative Cloud All Apps, Netflix 4K UHD, TradingView Premium..."
                />
              </div>

              {/* Category Quick Chips Selector */}
              <div>
                <label className="block text-sm font-extrabold text-[#0F172A] mb-2.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <HiCollection className="w-4 h-4 text-[#5B4BFF]" />
                    <span>Select Category *</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Choose best match</span>
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((cat) => {
                    const isSelected = formData.category === cat.value;
                    const Icon = cat.icon;
                    return (
                      <button
                        type="button"
                        key={cat.value}
                        onClick={() => handleCategorySelect(cat.value)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#EEF2FF] border-[#5B4BFF] text-[#5B4BFF] font-bold shadow-xs ring-1 ring-[#5B4BFF]/20'
                            : 'bg-[#F8FAFC] border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/80 font-medium'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg ${cat.bg} ${cat.text} flex items-center justify-center flex-shrink-0 text-sm`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[12px] truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Urgency & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Urgency Selector */}
                <div>
                  <label className="block text-sm font-extrabold text-[#0F172A] mb-2 flex items-center gap-1.5">
                    <HiClock className="w-4 h-4 text-[#5B4BFF]" />
                    <span>Urgency / Timeline *</span>
                  </label>
                  
                  <div className="space-y-2">
                    {priorityOptions.map((opt) => {
                      const isSelected = formData.priority === opt.value;
                      return (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => handlePrioritySelect(opt.value)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#EEF2FF] border-[#5B4BFF] text-[#5B4BFF] font-bold ring-1 ring-[#5B4BFF]/20'
                              : 'bg-[#F8FAFC] border-slate-200 text-slate-700 hover:bg-slate-100/80'
                          }`}
                        >
                          <div>
                            <span className="text-[13px] font-bold block">{opt.label}</span>
                            <span className="text-[11px] text-slate-400 block">{opt.sub}</span>
                          </div>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            isSelected ? 'bg-[#5B4BFF] text-white' : 'bg-slate-200/80 text-slate-600'
                          }`}>
                            {opt.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration (Months) & Reference Link */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="duration" className="block text-sm font-extrabold text-[#0F172A] mb-2 flex items-center gap-1.5">
                      <HiClock className="w-4 h-4 text-[#5B4BFF]" />
                      <span>Duration (Months)</span>
                    </label>
                    <input
                      type="number"
                      name="duration"
                      id="duration"
                      min="1"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-[14px] bg-[#F8FAFC] border border-slate-200 focus:bg-white focus:ring-[3px] focus:ring-[#5B4BFF]/15 focus:border-[#5B4BFF] transition-all outline-none text-slate-900 font-semibold text-sm"
                      placeholder="e.g. 1, 3, 6, 12"
                    />
                  </div>

                  <div>
                    <label htmlFor="referenceUrl" className="block text-sm font-extrabold text-[#0F172A] mb-2 flex items-center gap-1.5">
                      <HiLink className="w-4 h-4 text-[#5B4BFF]" />
                      <span>Reference URL (Optional)</span>
                    </label>
                    <input
                      type="url"
                      name="referenceUrl"
                      id="referenceUrl"
                      value={formData.referenceUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-[14px] bg-[#F8FAFC] border border-slate-200 focus:bg-white focus:ring-[3px] focus:ring-[#5B4BFF]/15 focus:border-[#5B4BFF] transition-all outline-none text-slate-900 font-medium text-sm placeholder-slate-400"
                      placeholder="https://official-pricing-page.com"
                    />
                  </div>
                </div>
              </div>

              {/* Requirements & Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-extrabold text-[#0F172A] mb-2 flex items-center gap-1.5">
                  <HiDocumentText className="w-4 h-4 text-[#5B4BFF]" />
                  <span>Requirements & Specifications *</span>
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-[16px] bg-[#F8FAFC] border border-slate-200 focus:bg-white focus:ring-[3px] focus:ring-[#5B4BFF]/15 focus:border-[#5B4BFF] transition-all outline-none text-slate-900 font-medium text-sm placeholder-slate-400 resize-none leading-relaxed"
                  placeholder="Describe your specific preferences: private email activation vs shared profile, number of allowed devices, renewal support..."
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button 
                  type="submit" 
                  size="lg"
                  className="w-full py-4 text-base font-extrabold rounded-[18px] bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED] hover:from-[#4F3FE8] hover:to-[#6D28D9] shadow-[0_8px_24px_rgba(91,75,255,0.35)] flex items-center justify-center gap-2 cursor-pointer" 
                  isLoading={loading}
                >
                  <HiPaperAirplane className="w-5 h-5 rotate-45 transform -translate-y-0.5" />
                  <span>Submit Sourcing Request</span>
                </Button>
                <p className="text-center text-xs text-slate-400 mt-3">
                  No payment is charged upon submission. You only pay once an offer is matched and accepted.
                </p>
              </div>

            </form>
          </motion.div>

          {/* Right Sidebar (4 Columns): Live Activity & Guarantee */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Activity Ticker Card */}
            <div className="bg-white rounded-[28px] border border-slate-200/90 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="text-[14px] font-extrabold text-[#0F172A] uppercase tracking-wider">
                    Recent Fulfillments
                  </h3>
                </div>
                <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  Live
                </span>
              </div>

              <div className="space-y-3">
                {recentFulfilled.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-[13px] font-bold text-slate-800 leading-tight">{item.name}</p>
                      <span className="text-[11px] text-slate-400 font-semibold">{item.time}</span>
                    </div>
                    <span className="text-xs font-black text-[#5B4BFF] bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Guarantee Card */}
            <div className="bg-gradient-to-br from-[#5B4BFF] to-[#7C3AED] rounded-[28px] p-6 text-white shadow-[0_12px_32px_rgba(91,75,255,0.25)] relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-4">
                <HiShieldCheck className="w-6 h-6" />
              </div>

              <h4 className="text-lg font-black tracking-tight mb-2">100% Zero-Risk Sourcing</h4>
              <p className="text-white/80 text-xs leading-relaxed mb-4">
                Every request fulfilled through StreamKart is backed by our full escrow refund protection and 24-hour dispute warranty.
              </p>

              <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold">
                <span>Verified Merchants Only</span>
                <span className="text-emerald-300">✓ Protected</span>
              </div>
            </div>

            {/* Need Help CTA */}
            <div className="bg-white rounded-[24px] border border-slate-200/90 p-5 shadow-xs text-center">
              <HiQuestionMarkCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h5 className="text-sm font-bold text-slate-800 mb-1">Have questions before requesting?</h5>
              <p className="text-xs text-slate-500 mb-3">Our support team is available 24/7 to assist with custom orders.</p>
              <Link to="/contact" className="text-xs font-extrabold text-[#5B4BFF] hover:underline">
                Contact Support &rarr;
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default RequestProduct;
