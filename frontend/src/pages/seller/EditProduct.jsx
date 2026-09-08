import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useProduct, useUpdateProduct } from '../../hooks/useProducts';
import Spinner from '../../components/ui/Spinner';
import { HiCheck, HiOutlineCube, HiOutlineCurrencyRupee } from 'react-icons/hi';

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

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: productData, isLoading } = useProduct(id);
  const updateMutation = useUpdateProduct();
  
  const [form, setForm] = useState({ 
    masterProductId: '', 
    description: '', 
    price: '', 
    category: 'ott', 
    features: '', 
    duration: '1 month',
    planName: 'Default Plan',
    deviceLoginCount: 1,
    deviceLoginType: 'Mobile Only'
  });

  const { data: masterProductsRes } = useQuery({
    queryKey: ['masterProducts'],
    queryFn: async () => {
      const res = await api.get('/master-products');
      return res;
    }
  });

  const masterProducts = masterProductsRes?.data || [];
  const selectedMasterProduct = masterProducts.find(p => p._id === form.masterProductId);
  const currentPlanNames = selectedMasterProduct?.planNames?.length > 0 ? selectedMasterProduct.planNames : ['Default Plan'];

  useEffect(() => {
    if (productData?.data) {
      const p = productData.data;
      setForm({
        masterProductId: p.masterProduct || '',
        description: p.description || '',
        price: p.price?.toString() || '',
        category: p.category || 'ott',
        features: p.features ? p.features.join(', ') : '',
        duration: p.duration || '1 month',
        planName: p.planName || 'Default Plan',
        deviceLoginCount: p.deviceLoginCount || 1,
        deviceLoginType: p.deviceLoginType || 'Mobile Only'
      });
    }
  }, [productData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const featuresArray = form.features ? form.features.split(',').map(f => f.trim()).filter(Boolean) : [];
    
    updateMutation.mutate({
      id,
      data: {
        ...form,
        price: Number(form.price),
        features: featuresArray
      }
    }, {
      onSuccess: () => {
        toast.success('Product listing updated successfully!');
        navigate('/seller/products');
      },
      onError: (err) => {
        toast.error(err?.message || 'Failed to update product');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Spinner size="lg" />
        <span className="text-sm font-semibold text-[#64748B]">Loading product details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to="/seller/products" className="text-[13px] font-bold text-[#5B4BFF] hover:underline mb-1 inline-block">
            ← Back to Inventory
          </Link>
          <h1 className="text-[26px] font-extrabold text-[#0F172A] tracking-[-0.02em]">Edit Product Listing</h1>
          <p className="text-[#64748B] text-[14px]">Update pricing, duration, features, and activation details for this listing.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Master Catalog Selection */}
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-2.5">
            Master Subscription Template
          </label>
          <div className="relative">
            <select 
              value={form.masterProductId || ''} 
              onChange={(e) => {
                const pid = e.target.value;
                const p = masterProducts.find(x => x._id === pid);
                const newPlanNames = p?.planNames?.length > 0 ? p.planNames : ['Default Plan'];
                setForm({ ...form, masterProductId: pid, planName: newPlanNames[0] });
              }} 
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] px-5 py-3.5 text-[#0F172A] font-bold text-[15px] focus:outline-none focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white appearance-none transition-all cursor-pointer"
            >
              <option value="" disabled>Search or select a product template...</option>
              {masterProducts.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#64748B]">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            </div>
          </div>
        </div>

        {/* Step 2: Configuration & Pricing Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Plan & Credentials */}
          <div className="lg:col-span-6 bg-white border border-[#E2E8F0] rounded-[24px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
            <h3 className="text-[16px] font-extrabold text-[#0F172A]">Product Configuration</h3>
            
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

          {/* Right Column: Pricing & Duration */}
          <div className="lg:col-span-6 bg-white border border-[#E2E8F0] rounded-[24px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <h3 className="text-[16px] font-extrabold text-[#0F172A]">Pricing & Taxonomy</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                    Selling Price (₹)
                  </label>
                  <div className="flex items-center gap-2 bg-[#F8FAFC] rounded-[12px] border border-[#E2E8F0] px-3.5 py-2.5 focus-within:border-[#5B4BFF] focus-within:ring-4 focus-within:ring-[#5B4BFF]/10 focus-within:bg-white transition-all">
                    <span className="text-[#94A3B8] font-bold">₹</span>
                    <input 
                      type="number" 
                      placeholder="e.g. 499" 
                      value={form.price} 
                      onChange={(e) => setForm({ ...form, price: e.target.value })} 
                      required 
                      className="w-full outline-none text-[#0F172A] font-extrabold text-[15px] bg-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select 
                    value={form.category} 
                    onChange={(e) => setForm({ ...form, category: e.target.value })} 
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-3.5 py-2.5 text-[14px] font-bold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white appearance-none transition-all cursor-pointer"
                  >
                    {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Duration Period
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. 1 Month, 3 Months, Lifetime" 
                  value={form.duration} 
                  onChange={(e) => setForm({ ...form, duration: e.target.value })} 
                  required
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-[#0F172A] text-[14px] font-semibold focus:outline-none focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white transition-all"
                />
              </div>

              <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-[16px] p-4 text-[12.5px] text-[#4338CA] leading-relaxed">
                ℹ️ Updated price and duration will reflect immediately across all public catalog browse cards and search results.
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#F1F5F9]">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => navigate('/seller/products')} 
                disabled={updateMutation.isPending}
                className="font-bold border-[#E2E8F0]"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#5B4BFF] hover:bg-[#4F3FE8] text-white font-bold shadow-[0_4px_14px_rgba(91,75,255,0.25)] px-6"
                loading={updateMutation.isPending}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
