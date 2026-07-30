import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { useCreateProduct } from '../../hooks/useProducts';
import ImageCropperModal from '../../components/ui/ImageCropperModal';

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
  
  // Image Upload States
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [croppedBlob, setCroppedBlob] = useState(null);

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
    // Create preview URL
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Process features into an array
    const featuresArray = form.features ? form.features.split(',').map(f => f.trim()).filter(f => f) : [];
    
    let base64Logo = '';
    if (croppedBlob) {
      base64Logo = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(croppedBlob);
      });
    }
    
    createMutation.mutate({
      ...form,
      logo: base64Logo,
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
            <Input label="Product Title" placeholder="e.g. ChatGPT Plus" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="bg-[#F8FAFC] border-transparent focus:bg-white" />
            
            <div>
              <label className="block text-[13px] font-bold text-[#334155] mb-3 uppercase tracking-[0.08em]">App Logo</label>
              <div className="flex items-center gap-5">
                {previewUrl ? (
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-[16px] bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center p-2 overflow-hidden">
                      <img src={previewUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-[16px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-white text-[11px] font-bold uppercase tracking-wider">Change</button>
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-[16px] bg-[#F8FAFC] border-2 border-dashed border-[#CBD5E1] flex flex-col items-center justify-center text-[#94A3B8] text-[11px] font-bold uppercase tracking-wide gap-1 hover:border-[#5B4BFF] hover:bg-[#EEF2FF] hover:text-[#5B4BFF] transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <span className="text-2xl">+</span>
                    <span>Upload</span>
                  </div>
                )}
                
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                />
                
                <div className="flex flex-col gap-2">
                  <Button type="button" variant="outline" size="sm" className="font-semibold" onClick={() => fileInputRef.current?.click()}>
                    {previewUrl ? 'Change Logo' : 'Choose File'}
                  </Button>
                  {previewUrl && (
                    <button type="button" className="text-[12px] text-[#EF4444] hover:text-[#DC2626] font-semibold text-left transition-colors" onClick={() => { setPreviewUrl(null); setCroppedBlob(null); }}>Remove logo</button>
                  )}
                </div>
              </div>
            </div>

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

      {imageSrc && (
        <ImageCropperModal
          isOpen={!!imageSrc}
          onClose={() => setImageSrc(null)}
          imageSrc={imageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setImageSrc(null)}
        />
      )}
    </div>
  );
};

export default AddProduct;
