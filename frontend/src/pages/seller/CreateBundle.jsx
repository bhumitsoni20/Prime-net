import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Reorder } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiCurrencyRupee } from 'react-icons/hi';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import ImageCropperModal from '../../components/ui/ImageCropperModal';



const CreateBundle = () => {
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
  
  // Image Upload States
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [croppedBlob, setCroppedBlob] = useState(null);

  // Fetch Master Products
  const { data: productsRes, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['masterProducts'],
    queryFn: async () => {
      const res = await api.get('/master-products');
      return res;
    },
    enabled: !!user?._id,
  });
  
  const products = productsRes?.data || [];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleCropComplete = (blob) => {
    setImageSrc(null);
    setCroppedBlob(blob);
    setPreviewUrl(URL.createObjectURL(blob));
  };

  const handleAddProduct = (productId) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;
    
    if (selectedProducts.find(p => p.masterProduct === productId)) {
      toast.error('Product is already in the bundle');
      return;
    }

    setSelectedProducts([...selectedProducts, {
      id: Math.random().toString(36).substr(2, 9), // UI id for Reorder
      masterProduct: product._id,
      title: product.name,
      price: 0,
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
  const discountAmount = originalPrice - Number(form.bundlePrice || 0);
  const discountPercent = originalPrice > 0 && form.bundlePrice > 0 
    ? Math.round((discountAmount / originalPrice) * 100) 
    : 0;

  const createBundleMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/bundles', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Bundle created successfully!');
      queryClient.invalidateQueries({ queryKey: ['sellerBundles'] });
      queryClient.invalidateQueries({ queryKey: ['publicBundles'] });
      queryClient.invalidateQueries({ queryKey: ['adminBundles'] });
      navigate('/seller'); // Redirect to seller dashboard
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create bundle');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedProducts.length < 2) {
      toast.error('A bundle must contain at least 2 products');
      return;
    }

    if (!croppedBlob) {
      toast.error('Please upload a bundle thumbnail');
      return;
    }

    if (!form.bundlePrice || form.bundlePrice <= 0) {
      toast.error('Please enter a valid bundle price');
      return;
    }

    let base64Logo = '';
    if (croppedBlob) {
      base64Logo = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(croppedBlob);
      });
    }

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      bundlePrice: Number(form.bundlePrice),
      originalPrice,
      duration: form.duration,
      thumbnail: base64Logo,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      products: selectedProducts.map(p => ({
        masterProduct: p.masterProduct,
        price: Number(p.price),
        duration: p.duration,
        accountType: p.accountType,
        screens: p.screens,
        warranty: p.warranty,
        deliveryTime: p.deliveryTime,
        notes: p.notes
      }))
    };

    createBundleMutation.mutate(payload);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">Create Bundle Listing</h1>
        <p className="text-[#64748B]">Combine multiple products into a single discounted package.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Info */}
        <div className="bg-white p-8 rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E2E8F0]">
          <h2 className="text-xl font-bold text-[#0F172A] mb-6">Bundle Details</h2>
          <div className="space-y-6">
            <Input 
              label="Bundle Title" 
              placeholder="e.g. Ultimate Entertainment Pack (Netflix + Prime + Spotify)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            
            <div>
              <label className="block text-[14px] font-bold text-[#1E293B] mb-2">Description</label>
              <textarea 
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] px-4 py-3 text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#5B4BFF]/20 focus:border-[#5B4BFF] transition-all min-h-[120px]"
                placeholder="Describe what's included in this bundle..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Tags (comma separated)" 
                placeholder="e.g. movies, music, premium"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
              <Input 
                label="Bundle Duration" 
                placeholder="e.g. 1 month, 3 months, Lifetime"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>
            
            {/* Thumbnail Upload */}
            <div>
              <label className="block text-[14px] font-bold text-[#1E293B] mb-2">Bundle Thumbnail</label>
              <div className="flex items-start gap-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-[120px] h-[120px] rounded-[24px] border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] flex flex-col items-center justify-center cursor-pointer hover:border-[#5B4BFF] hover:bg-[#5B4BFF]/5 transition-all overflow-hidden relative group"
                >
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-medium">Change</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl mb-2">📸</span>
                      <span className="text-[#64748B] text-xs font-medium">Upload Image</span>
                    </>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#64748B] mb-4">Upload a high-quality square image (recommended 512x512) for your bundle listing. This will be shown on the marketplace.</p>
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Choose Image
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bundle Builder */}
        <div className="bg-white p-8 rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E2E8F0]">
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Bundle Builder</h2>
          <p className="text-[#64748B] text-sm mb-6">Select products from your inventory to include in this bundle.</p>
          
          <div className="mb-6">
            <select 
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] px-4 py-3 h-[52px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#5B4BFF]/20 focus:border-[#5B4BFF] transition-all"
              onChange={(e) => {
                if(e.target.value) {
                  handleAddProduct(e.target.value);
                  e.target.value = "";
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>+ Add a product to bundle...</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>{p.title} - ₹{p.price}</option>
              ))}
            </select>
          </div>

          {selectedProducts.length > 0 && (
            <div className="space-y-4">
              <Reorder.Group axis="y" values={selectedProducts} onReorder={setSelectedProducts}>
                {selectedProducts.map((p) => (
                  <Reorder.Item key={p.id} value={p} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] p-5 mb-4 cursor-grab active:cursor-grabbing relative">
                    <div className="absolute top-4 right-4">
                      <button type="button" onClick={() => handleRemoveProduct(p.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                        <HiTrash size={16} />
                      </button>
                    </div>
                    
                    <h3 className="font-bold text-[#0F172A] mb-4 text-lg pr-12">☰ {p.title}</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Input 
                        label="Allocated Price (₹)" 
                        type="number"
                        value={p.price}
                        onChange={(e) => updateProductDetails(p.id, 'price', e.target.value)}
                        required
                      />
                      <Input 
                        label="Duration" 
                        value={p.duration}
                        onChange={(e) => updateProductDetails(p.id, 'duration', e.target.value)}
                        required
                      />
                      <Input 
                        label="Account Type" 
                        value={p.accountType}
                        onChange={(e) => updateProductDetails(p.id, 'accountType', e.target.value)}
                        required
                      />
                      <Input 
                        label="Screens/Devices" 
                        value={p.screens}
                        onChange={(e) => updateProductDetails(p.id, 'screens', e.target.value)}
                        required
                      />
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="bg-white p-8 rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E2E8F0]">
          <h2 className="text-xl font-bold text-[#0F172A] mb-6">Pricing & Savings</h2>
          
          <div className="flex flex-col md:flex-row gap-8 items-center bg-[#F8FAFC] p-6 rounded-[16px] border border-[#E2E8F0]">
            <div className="flex-1 w-full">
              <Input 
                label="Bundle Selling Price (₹)" 
                type="number"
                placeholder="e.g. 799"
                value={form.bundlePrice}
                onChange={(e) => setForm({ ...form, bundlePrice: e.target.value })}
                required
              />
            </div>
            
            <div className="hidden md:block h-16 w-px bg-[#E2E8F0]"></div>
            
            <div className="flex-1 w-full flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[#64748B] font-medium">Original Price:</span>
                <span className="text-[#0F172A] font-bold line-through">₹{originalPrice}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B] font-medium">Bundle Price:</span>
                <span className="text-[#5B4BFF] font-black text-xl">₹{form.bundlePrice || 0}</span>
              </div>
              
              {discountPercent > 0 && (
                <div className="mt-2 flex gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-sm rounded-full">
                    Save ₹{discountAmount}
                  </span>
                  <span className="px-3 py-1 bg-[#5B4BFF]/10 text-[#5B4BFF] font-bold text-sm rounded-full">
                    {discountPercent}% OFF
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/seller/dashboard')}>Cancel</Button>
          <Button type="submit" isLoading={createBundleMutation.isLoading} className="px-8 shadow-xl shadow-[#5B4BFF]/20">
            Publish Bundle
          </Button>
        </div>
      </form>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={!!imageSrc}
        onClose={() => setImageSrc(null)}
        imageSrc={imageSrc}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};

export default CreateBundle;
