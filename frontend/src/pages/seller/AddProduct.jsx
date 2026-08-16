import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useCreateProduct } from '../../hooks/useProducts';
import useAuthStore from '../../store/authStore';

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
  { id: 'Mobile Only', icon: '📱' },
  { id: 'TV/PC Only', icon: '💻' },
  { id: 'Own Mail', icon: '📧' },
  { id: 'Own Number', icon: '📞' }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.masterProductId) {
      return toast.error('Please select a master product');
    }

    const validPricings = Object.entries(form.pricing).filter(([_, price]) => price && Number(price) > 0);
    if (validPricings.length === 0) {
      return toast.error('Please set a price for at least one duration');
    }

    // Process features into an array
    const featuresArray = form.features ? form.features.split(',').map(f => f.trim()).filter(f => f) : [];
    
    try {
      // Loop through each filled pricing tier and create a separate product
      await Promise.all(validPricings.map(async ([duration, price]) => {
        return createMutation.mutateAsync({
          title: selectedMasterProduct?.name || 'Unknown',
          description: form.description,
          category: form.category,
          features: featuresArray,
          masterProductId: form.masterProductId,
          planName: form.planName,
          deviceLoginCount: form.deviceLoginCount,
          deviceLoginType: form.deviceLoginType,
          duration: duration,
          price: Number(price)
        });
      }));

      toast.success('Product(s) created successfully!');
      navigate('/seller/products');
    } catch (err) {
      toast.error(err?.message || 'Failed to create products');
    }
  };

  const handlePriceChange = (duration, value) => {
    setForm({
      ...form,
      pricing: { ...form.pricing, [duration]: value }
    });
  };

  return (
    <div className="py-2">
      <h1 className="text-[28px] font-extrabold text-[#0F172A] mb-8 tracking-[-0.02em]">Add New Product</h1>
      
      <form onSubmit={handleSubmit} className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 max-w-5xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow">
        
        {/* Top: Product Selection */}
        <div className="mb-8">
          <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-[0.08em]">Select Product</label>
          <div className="relative" ref={dropdownRef}>
            <div 
              onClick={() => setIsOpen(!isOpen)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] px-5 py-3.5 text-[#0F172A] cursor-pointer flex items-center justify-between transition-all font-medium hover:border-[#5B4BFF]/50"
            >
              {selectedMasterProduct ? (
                <div className="flex items-center gap-3">
                  <img src={selectedMasterProduct.imageUrl} alt={selectedMasterProduct.name} className="w-6 h-6 object-contain rounded bg-white p-0.5 border border-gray-100" />
                  <span>{selectedMasterProduct.name}</span>
                </div>
              ) : (
                <span className="text-[#94A3B8]">Search or select a product...</span>
              )}
              <svg className={`w-4 h-4 text-[#64748B] transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            
            {isOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-[#E2E8F0] rounded-[16px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] max-h-64 overflow-auto py-2">
                {masterProducts.map((p) => (
                  <div 
                    key={p._id}
                    className={`flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-[#F8FAFC] transition-colors ${form.masterProductId === p._id ? 'bg-[#F1F5F9] font-bold text-[#5B4BFF]' : 'text-[#0F172A]'}`}
                    onClick={() => {
                      const newPlanNames = p.planNames?.length > 0 ? p.planNames : ['Default Plan'];
                      setForm({ ...form, masterProductId: p._id, category: p.category || 'ott', planName: newPlanNames[0] });
                      setIsOpen(false);
                    }}
                  >
                    <img src={p.imageUrl} alt={p.name} className="w-8 h-8 object-contain rounded-lg bg-white border border-[#E2E8F0] p-1 shadow-sm" />
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-bold text-[#334155] mb-2">Category or Plan Name</label>
                <select 
                  value={form.planName} 
                  onChange={(e) => setForm({ ...form, planName: e.target.value })} 
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-4 py-3 text-[#0F172A] focus:outline-none focus:ring-[2px] focus:ring-[#5B4BFF]/20 focus:border-[#5B4BFF] appearance-none font-medium"
                >
                  {currentPlanNames.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#334155] mb-2">Number of Device Login</label>
                <select 
                  value={form.deviceLoginCount} 
                  onChange={(e) => setForm({ ...form, deviceLoginCount: Number(e.target.value) })} 
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-4 py-3 text-[#0F172A] focus:outline-none focus:ring-[2px] focus:ring-[#5B4BFF]/20 focus:border-[#5B4BFF] appearance-none font-medium"
                >
                  {[1,2,3,4,5].map(num => <option key={num} value={num}>{num}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#334155] mb-3">Select Device/Login (Anyone)</label>
              <div className="flex flex-wrap gap-3">
                {deviceLoginTypes.map((type) => (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => setForm({ ...form, deviceLoginType: type.id })}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-[12px] border font-medium text-[14px] transition-all ${
                      form.deviceLoginType === type.id 
                        ? 'bg-[#F0FDF4] border-[#22C55E] text-[#15803D]' 
                        : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span>{type.icon}</span>
                    {type.id}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#334155] mb-2">Description (Max 200 words) (Optional)</label>
              <textarea 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                rows={4} 
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] px-5 py-3.5 text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white transition-all resize-none" 
                placeholder="Enter Description"
              />
            </div>
            
            <Input label="Features" placeholder="Comma-separated (e.g. 4K Ultra HD, 4 Screens)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="bg-[#F8FAFC] border-transparent focus:bg-white" />
          </div>

          {/* Right Column (Pricing) */}
          <div className="bg-[#F8FAFC] p-6 rounded-[20px] border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-6">
              <label className="text-[15px] font-bold text-[#0F172A]">Set your pricing</label>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {['15 Days', '30 Days', '45 Days', '3 Months', '6 Months', '1 Year'].map((duration) => {
                const isRestricted = (duration === '6 Months' || duration === '1 Year');
                const isDisabled = isRestricted && !isVerified;

                return (
                  <div key={duration} className={`bg-white rounded-[12px] border ${isDisabled ? 'border-[#E2E8F0] opacity-50 bg-gray-50' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'} p-3 transition-colors`}>
                    <div className="text-[12px] text-center font-bold text-[#64748B] mb-2 whitespace-nowrap">{duration}</div>
                    <div className="flex items-center gap-1 border-b border-[#E2E8F0] pb-1">
                      <span className="text-[#94A3B8] font-medium">₹</span>
                      <input 
                        type="number" 
                        disabled={isDisabled}
                        value={form.pricing[duration]}
                        onChange={(e) => handlePriceChange(duration, e.target.value)}
                        className="w-full outline-none text-[#0F172A] font-bold bg-transparent text-center"
                        placeholder="0"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {!isVerified && (
              <div className="mt-6 bg-[#FEF2F2] border border-[#FCA5A5] rounded-[12px] p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <h4 className="text-[13px] font-bold text-[#991B1B]">Verified Sellers Only</h4>
                  <p className="text-[12px] text-[#B91C1C] mt-1">Make at least 10 sales to unlock 6 Months and 1 Year pricing plans.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row gap-4 pt-8 mt-8 border-t border-[#F1F5F9] sm:justify-end">
          <Button type="button" variant="secondary" size="lg" className="w-full sm:w-40" onClick={() => navigate('/seller/products')} disabled={createMutation.isPending}>Cancel</Button>
          <Button type="submit" size="lg" className="w-full sm:w-60 bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-[0_4px_14px_rgba(34,197,94,0.3)] border-none" loading={createMutation.isPending}>List Your Subscription Now</Button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
