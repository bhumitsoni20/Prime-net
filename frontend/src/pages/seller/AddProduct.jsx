import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useCreateProduct } from '../../hooks/useProducts';
import useAuthStore from '../../store/authStore';
import { 
  HiOutlineCube, 
  HiOutlineShieldCheck, 
  HiOutlineSparkles,
  HiOutlineCurrencyRupee,
  HiCheck,
  HiLockClosed
} from 'react-icons/hi';

const categories = [
  { value: 'ott', label: 'OTT Platforms' },
  { value: 'gaming', label: 'Games & Accounts' },
  { value: 'ai-tools', label: 'AI & Productivity' },
  { value: 'vpn', label: 'VPN & Security' },
  { value: 'education', label: 'Education & Learning' },
  { value: 'cloud-storage', label: 'Cloud & Storage' },
  { value: 'music', label: 'Music & Audio' },
  { value: 'software', label: 'Software & Tools' },
];

const deviceLoginTypes = [
  { id: 'Mobile Only', label: 'Mobile Only', icon: '📱', desc: '1 Screen Phone/Tablet' },
  { id: 'TV/PC Only', label: 'TV/PC Only', icon: '💻', desc: 'Large Screen Display' },
  { id: 'Own Mail', label: 'Own Mail', icon: '📧', desc: 'Buyer Profile / Email' },
  { id: 'Own Number', label: 'Own Number', icon: '📞', desc: 'OTP Activation' }
];

const AddProduct = () => {
  const navigate = useNavigate();
  const createMutation = useCreateProduct();
  const { user } = useAuthStore();
  const isVerified = (user?.totalSales || 0) >= 10;

  const [form, setForm] = useState({ 
    description: '', 
    category: 'ott', 
    features: '',
    planName: 'Default Plan',
    deviceLoginCount: 1,
    deviceLoginType: 'Mobile Only',
    masterProductId: '',
    pricing: {
      '15 Days': '',
      '30 Days': '',
      '45 Days': '',
      '3 Months': '',
      '6 Months': '',
      '1 Year': ''
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [masterSearch, setMasterSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const { data: masterProductsRes, isLoading: isLoadingMasters } = useQuery({
    queryKey: ['masterProducts'],
    queryFn: async () => {
      const res = await api.get('/master-products');
      return res;
    }
  });

  const masterProducts = masterProductsRes?.data || [];
  const selectedMasterProduct = masterProducts.find(p => p._id === form.masterProductId);
  const currentPlanNames = selectedMasterProduct?.planNames?.length > 0 ? selectedMasterProduct.planNames : ['Default Plan'];

  const filteredMasterProducts = masterProducts.filter(p => 
    p.name.toLowerCase().includes(masterSearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.masterProductId) {
      return toast.error('Please select a master catalog product');
    }

    const validPricings = Object.entries(form.pricing).filter(([_, price]) => price && Number(price) > 0);
    if (validPricings.length === 0) {
      return toast.error('Please enter a price for at least one duration tier');
    }

    const featuresArray = form.features ? form.features.split(',').map(f => f.trim()).filter(Boolean) : [];
    
    try {
      await Promise.all(validPricings.map(async ([duration, price]) => {
        return createMutation.mutateAsync({
          title: selectedMasterProduct?.name || 'Unknown Product',
          description: form.description,
          category: form.category,
          features: featuresArray,
          masterProductId: form.masterProductId,
          planName: form.planName,
          deviceLoginCount: form.deviceLoginCount,
          deviceLoginType: form.deviceLoginType || undefined,
          duration: duration,
          price: Number(price)
        });
      }));

      toast.success('Product listing(s) created successfully!');
      navigate('/seller/products');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to list product');
    }
  };

  const handlePriceChange = (duration, value) => {
    setForm({
      ...form,
      pricing: { ...form.pricing, [duration]: value }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to="/seller/products" className="text-[13px] font-bold text-[#5B4BFF] hover:underline mb-1 inline-block">
            ← Back to Inventory
          </Link>
          <h1 className="text-[26px] font-extrabold text-[#0F172A] tracking-[-0.02em]">Add New Product Listing</h1>
          <p className="text-[#64748B] text-[14px]">Select from master subscription templates and configure your duration pricing.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Master Catalog Selection */}
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-2.5">
            1. Select Master Subscription Product
          </label>
          <div className="relative" ref={dropdownRef}>
            <div 
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full bg-[#F8FAFC] border rounded-[16px] px-5 py-4 text-[#0F172A] cursor-pointer flex items-center justify-between transition-all ${
                isOpen ? 'border-[#5B4BFF] ring-4 ring-[#5B4BFF]/10 bg-white' : 'border-[#E2E8F0] hover:border-[#5B4BFF]/40'
              }`}
            >
              {selectedMasterProduct ? (
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-[10px] bg-white border border-[#E2E8F0] p-1 shadow-xs flex items-center justify-center flex-shrink-0">
                    <img src={selectedMasterProduct.imageUrl} alt={selectedMasterProduct.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div>
                    <span className="font-extrabold text-[15px] text-[#0F172A] block">{selectedMasterProduct.name}</span>
                    <span className="text-[12px] text-[#64748B] capitalize">{selectedMasterProduct.category || 'General'} template</span>
                  </div>
                </div>
              ) : (
                <span className="text-[#94A3B8] font-medium text-[14px]">Search or select a product template from master catalog...</span>
              )}
              <svg className={`w-4 h-4 text-[#64748B] transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            
            {isOpen && (
              <div className="absolute z-20 w-full mt-2 bg-white border border-[#E2E8F0] rounded-[20px] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.12)] max-h-72 overflow-hidden flex flex-col">
                <div className="p-3 border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  <input
                    type="text"
                    placeholder="Type to filter products..."
                    value={masterSearch}
                    onChange={(e) => setMasterSearch(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-[12px] px-3.5 py-2 text-[13px] text-[#0F172A] outline-none focus:border-[#5B4BFF]"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto p-2 divide-y divide-[#F1F5F9]">
                  {filteredMasterProducts.length === 0 ? (
                    <div className="p-6 text-center text-[13px] text-[#64748B]">No master products match your search.</div>
                  ) : (
                    filteredMasterProducts.map((p) => (
                      <div 
                        key={p._id}
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-[12px] cursor-pointer transition-colors ${
                          form.masterProductId === p._id ? 'bg-[#EEF2FF] font-bold text-[#5B4BFF]' : 'hover:bg-[#F8FAFC] text-[#0F172A]'
                        }`}
                        onClick={() => {
                          const newPlanNames = p.planNames?.length > 0 ? p.planNames : ['Default Plan'];
                          setForm({ ...form, masterProductId: p._id, category: p.category || 'ott', planName: newPlanNames[0] });
                          setIsOpen(false);
                          setMasterSearch('');
                        }}
                      >
                        <div className="w-9 h-9 rounded-[8px] bg-white border border-[#E2E8F0] p-1 flex items-center justify-center flex-shrink-0">
                          <img src={p.imageUrl} alt={p.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[14px]">{p.name}</div>
                          <div className="text-[11px] text-[#64748B] capitalize">{p.category}</div>
                        </div>
                        {form.masterProductId === p._id && (
                          <HiCheck className="w-5 h-5 text-[#5B4BFF]" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Configuration & Pricing Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Plan & Credentials Configuration */}
          <div className="lg:col-span-6 bg-white border border-[#E2E8F0] rounded-[24px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
            <h3 className="text-[16px] font-extrabold text-[#0F172A]">2. Product Configuration</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Plan Tier
                </label>
                <select 
                  value={form.planName} 
                  onChange={(e) => setForm({ ...form, planName: e.target.value })} 
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-3.5 py-2.5 text-[14px] font-bold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white transition-all cursor-pointer"
                >
                  {currentPlanNames.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Device Screen Limit
                </label>
                <select 
                  value={form.deviceLoginCount} 
                  onChange={(e) => setForm({ ...form, deviceLoginCount: Number(e.target.value) })} 
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-3.5 py-2.5 text-[14px] font-bold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white transition-all cursor-pointer"
                >
                  {[1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num} {num === 1 ? 'Screen' : 'Screens'}</option>)}
                </select>
              </div>
            </div>

            {/* Device Login Types Selector */}
            <div>
              <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                Device / Activation Mode
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {deviceLoginTypes.map((type) => (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => setForm({ ...form, deviceLoginType: type.id })}
                    className={`p-3 rounded-[14px] border text-left transition-all ${
                      form.deviceLoginType === type.id 
                        ? 'bg-[#EEF2FF] border-[#5B4BFF] ring-2 ring-[#5B4BFF]/20' 
                        : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-base">{type.icon}</span>
                      <span className={`font-bold text-[13px] ${form.deviceLoginType === type.id ? 'text-[#5B4BFF]' : 'text-[#0F172A]'}`}>
                        {type.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B]">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                Listing Highlights / Description (Optional)
              </label>
              <textarea 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                rows={3} 
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] px-4 py-3 text-[#0F172A] text-[13.5px] placeholder-[#94A3B8] focus:outline-none focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white transition-all resize-none" 
                placeholder="Mention warranty terms, profile rules, or instant delivery specifics..."
              />
            </div>

            {/* Features */}
            <div>
              <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                Key Features (Comma-Separated)
              </label>
              <input 
                type="text"
                placeholder="e.g. 4K Ultra HD, Private Profile, 24/7 Replacement"
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] px-4 py-2.5 text-[#0F172A] text-[13.5px] placeholder-[#94A3B8] focus:outline-none focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Right Column: Duration Pricing Matrix */}
          <div className="lg:col-span-6 bg-white border border-[#E2E8F0] rounded-[24px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-extrabold text-[#0F172A]">3. Duration Pricing Matrix</h3>
                <span className="text-[11px] font-bold text-[#5B4BFF] bg-[#EEF2FF] px-2.5 py-0.5 rounded-full">
                  INR (₹)
                </span>
              </div>
              <p className="text-[13px] text-[#64748B] mb-5">
                Fill in the selling price for each duration you want to offer. Each filled duration will create an instant marketplace listing.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['15 Days', '30 Days', '45 Days', '3 Months', '6 Months', '1 Year'].map((duration) => {
                  const isRestricted = (duration === '6 Months' || duration === '1 Year');
                  const isDisabled = isRestricted && !isVerified;

                  return (
                    <div 
                      key={duration} 
                      className={`p-3 rounded-[14px] border transition-all ${
                        isDisabled 
                          ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-60' 
                          : form.pricing[duration] 
                          ? 'bg-[#F0FDF4] border-[#86EFAC] ring-2 ring-[#22C55E]/10' 
                          : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                        <span>{duration}</span>
                        {isDisabled && <HiLockClosed className="w-3.5 h-3.5 text-[#94A3B8]" />}
                      </div>
                      <div className="flex items-center gap-1 bg-white rounded-[10px] border border-[#E2E8F0] px-2.5 py-1.5 focus-within:border-[#5B4BFF] focus-within:ring-2 focus-within:ring-[#5B4BFF]/10">
                        <span className="text-[#94A3B8] font-bold text-xs">₹</span>
                        <input 
                          type="number" 
                          disabled={isDisabled}
                          value={form.pricing[duration]}
                          onChange={(e) => handlePriceChange(duration, e.target.value)}
                          className="w-full outline-none text-[#0F172A] font-extrabold text-[14px] bg-transparent text-right"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {!isVerified && (
                <div className="mt-5 bg-[#FFFBEB] border border-[#FDE68A] rounded-[16px] p-4 flex items-start gap-3">
                  <HiLockClosed className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[13px] font-bold text-[#92400E]">Verified Merchant Tier</h4>
                    <p className="text-[12px] text-[#B45309] mt-0.5 leading-relaxed">
                      Complete 10 successful sales on StreamKart to unlock 6 Months and 1 Year high-ticket duration plans.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-[#F1F5F9]">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => navigate('/seller/products')} 
                disabled={createMutation.isPending}
                className="font-bold border-[#E2E8F0]"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#5B4BFF] hover:bg-[#4F3FE8] text-white font-bold shadow-[0_4px_14px_rgba(91,75,255,0.25)] px-6"
                loading={createMutation.isPending}
              >
                Publish Listing
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
