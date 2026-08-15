import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useCreateProduct } from '../../hooks/useProducts';

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

const AddProduct = () => {
  const navigate = useNavigate();
  const createMutation = useCreateProduct();
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'ai-tools', features: '', duration: '1 month', deliveryType: 'instant' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.masterProductId) {
      return toast.error('Please select a master product');
    }

    // Process features into an array
    const featuresArray = form.features ? form.features.split(',').map(f => f.trim()).filter(f => f) : [];
    
    createMutation.mutate({
      ...form,
      title: selectedMasterProduct?.name || 'Unknown',
      price: Number(form.price),
      features: featuresArray
    }, {
      onSuccess: () => {
        toast.success('Product created!');
        navigate('/seller/products');
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to create product');
      }
    });
  };

  return (
    <div className="py-2">
      <h1 className="text-[28px] font-extrabold text-[#0F172A] mb-8 tracking-[-0.02em]">Add New Product</h1>
      
      <form onSubmit={handleSubmit} className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 max-w-5xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
          
          {/* Left Column */}
          <div className="space-y-6">
            <div>
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
                          setForm({ ...form, masterProductId: p._id });
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
            
            {selectedMasterProduct && (
              <div className="flex items-center gap-4 bg-[#F8FAFC] p-4 rounded-[16px] border border-[#E2E8F0]">
                <div className="w-16 h-16 rounded-[12px] bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center p-1.5 overflow-hidden">
                  <img src={selectedMasterProduct.imageUrl} alt={selectedMasterProduct.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Product Identity</div>
                  <div className="text-[16px] font-extrabold text-[#0F172A]">{selectedMasterProduct.name}</div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-[0.08em]">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] px-5 py-3.5 text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white transition-all resize-none" required />
            </div>
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
            
            <Input label="Features" placeholder="Comma-separated (e.g. 4K Ultra HD, 4 Screens, 1 Year)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="bg-[#F8FAFC] border-transparent focus:bg-white" />
          </div>
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row gap-4 pt-8 mt-8 border-t border-[#F1F5F9] sm:justify-end">
          <Button type="button" variant="secondary" size="lg" className="w-full sm:w-40" onClick={() => navigate('/seller/products')} disabled={createMutation.isPending}>Cancel</Button>
          <Button type="submit" size="lg" className="w-full sm:w-48 shadow-[0_4px_14px_rgba(91,75,255,0.3)] flex justify-center" loading={createMutation.isPending}>Create Product</Button>
        </div>
      </form>

    </div>
  );
};

export default AddProduct;
