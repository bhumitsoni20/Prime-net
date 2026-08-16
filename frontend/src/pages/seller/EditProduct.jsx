import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useProduct, useUpdateProduct } from '../../hooks/useProducts';
import Spinner from '../../components/ui/Spinner';

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
    
    const featuresArray = form.features ? form.features.split(',').map(f => f.trim()).filter(f => f) : [];
    
    updateMutation.mutate({
      id,
      data: {
        ...form,
        price: Number(form.price),
        features: featuresArray
      }
    }, {
      onSuccess: () => {
        toast.success('Product updated!');
        navigate('/seller/products');
      },
      onError: (err) => {
        toast.error(err?.message || 'Failed to update product');
      }
    });
  };

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div className="py-2">
      <Link to="/seller/products" className="text-[#5B4BFF] text-[14px] font-semibold hover:text-[#4F3FE8] mb-6 inline-block transition-colors">← Back to Products</Link>
      <h1 className="text-[28px] font-extrabold text-[#0F172A] mb-8 tracking-[-0.02em]">Edit Product</h1>
      
      <form onSubmit={handleSubmit} className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 max-w-5xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow">
        
        {/* Top: Product Selection */}
        <div className="mb-8">
          <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-[0.08em]">Select Product</label>
          <div className="relative">
            <select 
              value={form.masterProductId || ''} 
              onChange={(e) => {
                const pid = e.target.value;
                const p = masterProducts.find(x => x._id === pid);
                const newPlanNames = p?.planNames?.length > 0 ? p.planNames : ['Default Plan'];
                setForm({ ...form, masterProductId: pid, planName: newPlanNames[0] });
              }} 
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] px-5 py-3.5 text-[#0F172A] focus:outline-none focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white appearance-none transition-all font-medium"
            >
              <option value="" disabled>Search or select a product...</option>
              {masterProducts.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#64748B]">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            </div>
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
              />
            </div>
            
            <Input label="Features" placeholder="Comma-separated (e.g. 4K Ultra HD, 4 Screens, 1 Year)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="bg-[#F8FAFC] border-transparent focus:bg-white" />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Input label="Price (₹)" type="number" placeholder="999" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="bg-[#F8FAFC] border-transparent focus:bg-white" />
              <div>
                <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-[0.08em]">Category</label>
                <div className="relative">
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] px-5 py-3.5 text-[#0F172A] focus:outline-none focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white appearance-none transition-all font-medium">
                    {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#64748B]">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                  </div>
                </div>
              </div>
            </div>
            
            <Input label="Duration" placeholder="e.g. 1 month, 3 months, Lifetime" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="bg-[#F8FAFC] border-transparent focus:bg-white" />
          </div>
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row gap-4 pt-8 mt-8 border-t border-[#F1F5F9] sm:justify-end">
          <Button type="button" variant="secondary" size="lg" className="w-full sm:w-40" onClick={() => navigate('/seller/products')} disabled={updateMutation.isPending}>Cancel</Button>
          <Button type="submit" size="lg" className="w-full sm:w-48 shadow-[0_4px_14px_rgba(91,75,255,0.3)] flex justify-center" loading={updateMutation.isPending}>Update Product</Button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
