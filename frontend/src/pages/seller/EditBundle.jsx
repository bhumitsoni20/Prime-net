import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, Reorder } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiCurrencyRupee } from 'react-icons/hi';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const EditBundle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [form, setForm] = useState({
    title: '',
    description: '',
    bundlePrice: '',
    category: 'bundles',
    tags: '',
    duration: '1 month',
  });

  const [selectedProducts, setSelectedProducts] = useState([]);
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

  // Fetch Master Products
  const { data: productsRes } = useQuery({
    queryKey: ['masterProducts'],
    queryFn: async () => {
      const res = await api.get('/master-products');
      return res;
    },
    enabled: !!user?._id,
  });

  const products = productsRes?.data || [];

  const filteredMasterProducts = products.filter(p =>
    p.name.toLowerCase().includes(masterSearch.toLowerCase())
  );

  const { data: bundleData, isLoading: isLoadingBundle } = useQuery({
    queryKey: ['bundle', id],
    queryFn: async () => {
      const res = await api.get(`/bundles/${id}`);
      return res;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (bundleData?.data) {
      const b = bundleData.data;
      setForm({
        title: b.title || '',
        description: b.description || '',
        bundlePrice: b.bundlePrice?.toString() || '',
        category: b.category || 'bundles',
        tags: b.tags ? b.tags.join(', ') : '',
        duration: b.duration || '1 month',
      });

      if (b.products) {
        setSelectedProducts(b.products.map(p => {
          const masterProductObj = p.masterProduct || {};
          return {
            id: Math.random().toString(36).substr(2, 9),
            masterProduct: masterProductObj._id || masterProductObj,
            title: masterProductObj.name || 'Product',
            imageUrl: masterProductObj.imageUrl,
            price: p.price,
            duration: p.duration || '1 month',
            accountType: p.accountType || 'Shared',
            screens: p.screens || '1 Screen',
            warranty: p.warranty || 'Full',
            deliveryTime: p.deliveryTime || 'Instant',
            notes: p.notes || ''
          };
        }));
      }
    }
  }, [bundleData]);

  const handleAddProduct = (productId) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;
    
    if (selectedProducts.find(p => p.masterProduct === productId)) {
      toast.error('Product is already in the bundle');
      return;
    }

    setSelectedProducts([...selectedProducts, {
      id: Math.random().toString(36).substr(2, 9),
      masterProduct: product._id,
      title: product.name,
      imageUrl: product.imageUrl,
      price: '',
      duration: '1 month',
      accountType: 'Shared',
      screens: '1 Screen',
      warranty: 'Full',
      deliveryTime: 'Instant',
      notes: ''
    }]);
  };

  const handleRemoveProduct = (uiId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== uiId));
  };

  const updateProductDetails = (uiId, field, value) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.id === uiId ? { ...p, [field]: value } : p
    ));
  };

  const originalPrice = selectedProducts.reduce((sum, p) => sum + Number(p.price || 0), 0);
  const discountAmount = Math.max(0, originalPrice - Number(form.bundlePrice || 0));
  const discountPercent = originalPrice > 0 && form.bundlePrice > 0 
    ? Math.round((discountAmount / originalPrice) * 100) 
    : 0;

  const updateBundleMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put(`/bundles/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Combo bundle updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['sellerBundles'] });
      queryClient.invalidateQueries({ queryKey: ['publicBundles'] });
      queryClient.invalidateQueries({ queryKey: ['adminBundles'] });
      navigate('/seller/bundles');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update bundle');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedProducts.length < 2) {
      return toast.error('A combo bundle must contain at least 2 subscription products');
    }

    if (!form.bundlePrice || Number(form.bundlePrice) <= 0) {
      return toast.error('Please enter a valid bundle selling price');
    }

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      bundlePrice: Number(form.bundlePrice),
      originalPrice,
      duration: form.duration,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      products: selectedProducts.map(p => ({
        masterProduct: p.masterProduct,
        price: Number(p.price || 0),
        duration: p.duration,
        accountType: p.accountType,
        screens: p.screens,
        warranty: p.warranty,
        deliveryTime: p.deliveryTime,
        notes: p.notes
      }))
    };

    updateBundleMutation.mutate(payload);
  };

  if (isLoadingBundle) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Spinner size="lg" />
        <span className="text-sm font-semibold text-[#64748B]">Loading bundle details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <Link to="/seller/bundles" className="text-[13px] font-bold text-[#5B4BFF] hover:underline mb-1 inline-block">
          ← Back to Combo Bundles
        </Link>
        <h1 className="text-[26px] font-extrabold text-[#0F172A] tracking-[-0.02em]">Edit Combo Bundle Package</h1>
        <p className="text-[#64748B] text-[14px]">Update the bundle pricing, subscription allocation, or descriptions.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Basic Bundle Details */}
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
          <h2 className="text-[16px] font-extrabold text-[#0F172A]">1. Bundle Information</h2>
          
          <div>
            <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Bundle Package Title
            </label>
            <input 
              type="text"
              placeholder="e.g. Ultimate Entertainment Pack (Netflix 4K + Prime Video + Spotify)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] px-4 py-3 text-[#0F172A] text-[14px] font-bold focus:outline-none focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Package Description
            </label>
            <textarea 
              rows={3}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] px-4 py-3 text-[#0F172A] text-[13.5px] placeholder-[#94A3B8] focus:outline-none focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white transition-all resize-none"
              placeholder="Describe the combined benefits, screen accounts, and instant delivery details..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                Bundle Duration
              </label>
              <input 
                type="text"
                placeholder="e.g. 1 Month, 3 Months"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-[#0F172A] text-[13.5px] font-semibold focus:outline-none focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                Search Tags (Comma-Separated)
              </label>
              <input 
                type="text"
                placeholder="e.g. ott, movies, premium, combo"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-[#0F172A] text-[13.5px] focus:outline-none focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* 2. Bundle Builder (Items) */}
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#0F172A]">2. Add Subscriptions to Bundle</h2>
              <p className="text-[13px] text-[#64748B]">Select at least 2 products to build your package deal.</p>
            </div>
            <span className="text-[11px] font-extrabold text-[#5B4BFF] bg-[#EEF2FF] px-3 py-1 rounded-full border border-[#E0E7FF]">
              {selectedProducts.length} Items Selected
            </span>
          </div>
          
          {/* Custom Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div 
              onClick={() => setIsOpen(!isOpen)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#5B4BFF]/50 rounded-[16px] px-4 py-3.5 text-[#0F172A] cursor-pointer flex items-center justify-between transition-all"
            >
              <span className="text-[#64748B] font-semibold text-[14px]">+ Add another subscription to bundle...</span>
              <svg className={`w-4 h-4 text-[#64748B] transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            
            {isOpen && (
              <div className="absolute z-20 w-full mt-2 bg-white border border-[#E2E8F0] rounded-[20px] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.12)] max-h-72 overflow-hidden flex flex-col">
                <div className="p-3 border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  <input
                    type="text"
                    placeholder="Search product to add..."
                    value={masterSearch}
                    onChange={(e) => setMasterSearch(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-[12px] px-3.5 py-2 text-[13px] text-[#0F172A] outline-none focus:border-[#5B4BFF]"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto p-2 divide-y divide-[#F1F5F9]">
                  {filteredMasterProducts.map((p) => {
                    const isAlreadyAdded = selectedProducts.some(sp => sp.masterProduct === p._id);
                    return (
                      <div 
                        key={p._id}
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-[12px] cursor-pointer transition-colors ${
                          isAlreadyAdded ? 'opacity-50 cursor-not-allowed bg-[#F8FAFC]' : 'hover:bg-[#EEF2FF]/60 text-[#0F172A]'
                        }`}
                        onClick={() => {
                          if (!isAlreadyAdded) {
                            handleAddProduct(p._id);
                            setIsOpen(false);
                            setMasterSearch('');
                          }
                        }}
                      >
                        <div className="w-9 h-9 rounded-[8px] bg-white border border-[#E2E8F0] p-1 flex items-center justify-center flex-shrink-0">
                          <img src={p.imageUrl} alt={p.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[14px]">{p.name}</div>
                          <div className="text-[11px] text-[#64748B] capitalize">{p.category}</div>
                        </div>
                        {isAlreadyAdded && (
                          <span className="text-[11px] font-bold text-[#64748B]">Added</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Selected Products Reorderable List */}
          {selectedProducts.length > 0 && (
            <div className="space-y-3 pt-2">
              <Reorder.Group axis="y" values={selectedProducts} onReorder={setSelectedProducts} className="space-y-3">
                {selectedProducts.map((p) => (
                  <Reorder.Item 
                    key={p.id} 
                    value={p} 
                    className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-[18px] p-4.5 cursor-grab active:cursor-grabbing shadow-xs transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-[#E2E8F0] pb-2.5">
                      <div className="flex items-center gap-2.5 font-extrabold text-[15px] text-[#0F172A]">
                        <span className="text-[#94A3B8] font-mono text-base">☰</span>
                        <span>{p.title}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveProduct(p.id)} 
                        className="p-1.5 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-full transition-colors"
                        title="Remove product"
                      >
                        <HiTrash size={16} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                          Allocated Price (₹)
                        </label>
                        <input 
                          type="number"
                          placeholder="e.g. 299"
                          value={p.price}
                          onChange={(e) => updateProductDetails(p.id, 'price', e.target.value)}
                          required
                          className="w-full bg-white border border-[#E2E8F0] rounded-[10px] px-3 py-2 text-[13px] font-bold text-[#0F172A] focus:border-[#5B4BFF] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                          Duration
                        </label>
                        <input 
                          type="text"
                          value={p.duration}
                          onChange={(e) => updateProductDetails(p.id, 'duration', e.target.value)}
                          required
                          className="w-full bg-white border border-[#E2E8F0] rounded-[10px] px-3 py-2 text-[13px] font-medium text-[#0F172A] focus:border-[#5B4BFF] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                          Account Type
                        </label>
                        <input 
                          type="text"
                          value={p.accountType}
                          onChange={(e) => updateProductDetails(p.id, 'accountType', e.target.value)}
                          required
                          className="w-full bg-white border border-[#E2E8F0] rounded-[10px] px-3 py-2 text-[13px] font-medium text-[#0F172A] focus:border-[#5B4BFF] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                          Screen/Devices
                        </label>
                        <input 
                          type="text"
                          value={p.screens}
                          onChange={(e) => updateProductDetails(p.id, 'screens', e.target.value)}
                          required
                          className="w-full bg-white border border-[#E2E8F0] rounded-[10px] px-3 py-2 text-[13px] font-medium text-[#0F172A] focus:border-[#5B4BFF] outline-none"
                        />
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          )}
        </div>

        {/* 3. Pricing & Savings Bento */}
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
          <h2 className="text-[16px] font-extrabold text-[#0F172A]">3. Pricing & Discount Value</h2>
          
          <div className="flex flex-col md:flex-row gap-6 items-stretch md:items-center bg-[#F8FAFC] p-6 rounded-[20px] border border-[#E2E8F0]">
            <div className="flex-1">
              <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                Bundle Selling Price (₹)
              </label>
              <div className="flex items-center gap-2 bg-white rounded-[14px] border border-[#E2E8F0] px-4 py-3 focus-within:border-[#5B4BFF] focus-within:ring-4 focus-within:ring-[#5B4BFF]/10 transition-all">
                <span className="text-[#94A3B8] font-black text-base">₹</span>
                <input 
                  type="number"
                  placeholder="e.g. 799"
                  value={form.bundlePrice}
                  onChange={(e) => setForm({ ...form, bundlePrice: e.target.value })}
                  required
                  className="w-full outline-none text-[#0F172A] font-extrabold text-[18px] bg-transparent"
                />
              </div>
            </div>
            
            <div className="hidden md:block h-16 w-px bg-[#E2E8F0]" />
            
            <div className="flex-1 flex flex-col justify-center space-y-2">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-[#64748B] font-semibold">Sum of Individual Prices:</span>
                <span className="text-[#0F172A] font-extrabold line-through">₹{originalPrice}</span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[#64748B] font-bold">Bundle Deal Price:</span>
                <span className="text-[#5B4BFF] font-black text-xl">₹{form.bundlePrice || 0}</span>
              </div>
              
              {discountPercent > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2.5 py-1 bg-[#ECFDF5] text-[#059669] font-bold text-xs rounded-full border border-[#A7F3D0]">
                    Save ₹{discountAmount}
                  </span>
                  <span className="px-2.5 py-1 bg-[#EEF2FF] text-[#5B4BFF] font-bold text-xs rounded-full border border-[#E0E7FF]">
                    {discountPercent}% OFF
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => navigate('/seller/bundles')}
            className="font-bold border-[#E2E8F0]"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            isLoading={updateBundleMutation.isPending}
            className="bg-[#5B4BFF] hover:bg-[#4F3FE8] text-white font-bold shadow-[0_4px_14px_rgba(91,75,255,0.25)] px-7"
          >
            Save Bundle Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditBundle;
