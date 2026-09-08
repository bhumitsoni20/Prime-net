import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  HiPlus, 
  HiTrash, 
  HiExclamation, 
  HiPencil, 
  HiSearch,
  HiCube,
  HiSparkles,
  HiCheckCircle,
  HiXCircle
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import ImageCropperModal from '../../components/ui/ImageCropperModal';

const ProductCatalog = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productToEdit, setProductToEdit] = useState(null);

  // Form states
  const [form, setForm] = useState({ name: '', status: 'active', planNames: [] });
  const [planInput, setPlanInput] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [croppedBlob, setCroppedBlob] = useState(null);
  const fileInputRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['masterProducts', searchTerm],
    queryFn: async () => {
      const res = await api.get('/master-products', { params: { search: searchTerm, limit: 100 } });
      return res;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => await api.post('/master-products', payload),
    onSuccess: () => {
      toast.success('Master product created successfully!');
      queryClient.invalidateQueries({ queryKey: ['masterProducts'] });
      resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create product')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => await api.put(`/master-products/${id}`, payload),
    onSuccess: () => {
      toast.success('Master product updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['masterProducts'] });
      resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update product')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/master-products/${id}`),
    onSuccess: () => {
      toast.success('Master product deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['masterProducts'] });
      setProductToDelete(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete product');
      setProductToDelete(null);
    }
  });

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

  const resetForm = () => {
    setIsAddModalOpen(false);
    setProductToEdit(null);
    setForm({ name: '', status: 'active', planNames: [] });
    setPlanInput('');
    setPreviewUrl(null);
    setCroppedBlob(null);
  };

  const openEditModal = (product) => {
    setForm({ 
      name: product.name, 
      status: product.status,
      planNames: product.planNames || []
    });
    setPlanInput('');
    setPreviewUrl(product.imageUrl);
    setCroppedBlob(null);
    setProductToEdit(product);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Product name is required');
    if (!previewUrl) return toast.error('Product icon/logo is required');

    let base64Logo = productToEdit?.imageUrl || '';
    if (croppedBlob) {
      base64Logo = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(croppedBlob);
      });
    }

    const payload = { ...form, imageUrl: base64Logo };

    if (productToEdit) {
      updateMutation.mutate({ id: productToEdit._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const products = data?.data || [];
  const activeCount = products.filter(p => p.status === 'active').length;
  const inactiveCount = products.filter(p => p.status === 'inactive').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-[26px] sm:text-[28px] font-extrabold text-[#0F172A] tracking-[-0.03em]">
              Master Product Catalog
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#5B4BFF]/10 text-[#5B4BFF] border border-[#5B4BFF]/20">
              <HiSparkles className="w-3.5 h-3.5" /> Official Templates
            </span>
          </div>
          <p className="text-[#64748B] text-[14.5px]">
            Manage certified brand templates and subscription plans available for seller listings.
          </p>
        </div>

        <Button 
          size="lg" 
          className="bg-[#5B4BFF] hover:bg-[#4E3EF0] text-white font-bold shadow-md shadow-[#5B4BFF]/25 px-6" 
          onClick={() => setIsAddModalOpen(true)}
        >
          <HiPlus className="w-5 h-5 mr-1.5" /> Add Master Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-[20px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">Total Catalog Items</span>
            <div className="text-[26px] font-extrabold text-[#0F172A]">{products.length}</div>
          </div>
          <div className="w-11 h-11 rounded-[12px] bg-indigo-50 border border-indigo-100 text-[#5B4BFF] flex items-center justify-center font-bold">
            <HiCube className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">Active for Sellers</span>
            <div className="text-[26px] font-extrabold text-emerald-600">{activeCount}</div>
          </div>
          <div className="w-11 h-11 rounded-[12px] bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <HiCheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Inactive / Archived</span>
            <div className="text-[26px] font-extrabold text-slate-700">{inactiveCount}</div>
          </div>
          <div className="w-11 h-11 rounded-[12px] bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold">
            <HiXCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="p-4 sm:p-6 border-b border-[#F1F5F9] bg-[#F8FAFC]/50 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input 
              placeholder="Search catalog by name or plan..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-white border border-[#E2E8F0] rounded-[12px] pl-10 pr-4 py-2 text-[13.5px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-left text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] bg-[#F8FAFC]">
                <th className="p-5 pl-7">Master Product Details</th>
                <th className="p-5">Supported Plans</th>
                <th className="p-5">Catalog Status</th>
                <th className="p-5 pr-7 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-[#94A3B8] font-medium animate-pulse">
                    Loading catalog templates...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-[#64748B] font-medium bg-[#F8FAFC]/50">
                    No master products found. Click "Add Master Product" to create one.
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product._id} className="hover:bg-indigo-50/20 transition-colors group">
                    <td className="p-5 pl-7">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[14px] border border-[#E2E8F0] bg-white shadow-xs overflow-hidden flex-shrink-0 p-1.5 flex items-center justify-center">
                          <img src={product.imageUrl} className="max-w-full max-h-full object-contain" alt={product.name} />
                        </div>
                        <div>
                          <p className="font-bold text-[15px] text-[#0F172A] group-hover:text-[#5B4BFF] transition-colors">
                            {product.name}
                          </p>
                          <p className="text-[11px] font-mono text-[#94A3B8]">ID: {product._id?.substring(0, 10)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      {product.planNames && product.planNames.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                          {product.planNames.map((plan, idx) => (
                            <span key={idx} className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-[6px]">
                              {plan}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[12px] text-[#94A3B8] italic">Standard single plan</span>
                      )}
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider border ${
                        product.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          product.status === 'active' ? 'bg-emerald-600' : 'bg-slate-400'
                        }`} />
                        {product.status}
                      </span>
                    </td>
                    <td className="p-5 pr-7 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(product)} 
                          className="p-2 text-[#64748B] hover:text-[#5B4BFF] hover:bg-indigo-50 rounded-[10px] border border-transparent hover:border-indigo-100 transition-all"
                          title="Edit Master Product"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setProductToDelete(product)} 
                          className="p-2 text-[#64748B] hover:text-[#EF4444] hover:bg-rose-50 rounded-[10px] border border-transparent hover:border-rose-100 transition-all"
                          title="Delete Master Product"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isAddModalOpen || !!productToEdit} onClose={resetForm} title={productToEdit ? "Edit Master Product Template" : "Add Master Product Template"}>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <Input 
            label="Product Title" 
            placeholder="e.g. Netflix Premium 4K / ChatGPT Plus" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            required 
          />

          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Available Plan Tiers (Press Enter to Add)
            </label>
            <div className="flex gap-2 mb-2.5">
              <input 
                type="text"
                placeholder="e.g. 1 Month UHD / Mobile 1 Screen"
                value={planInput}
                onChange={e => setPlanInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (planInput.trim()) {
                      setForm(f => ({ ...f, planNames: [...f.planNames, planInput.trim()] }));
                      setPlanInput('');
                    }
                  }
                }}
                className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-3.5 py-2.5 text-[14px] text-[#0F172A] focus:outline-none focus:border-[#5B4BFF] focus:ring-4 focus:ring-[#5B4BFF]/10 transition-all placeholder:text-[#94A3B8]"
              />
              <button 
                type="button" 
                onClick={() => {
                  if (planInput.trim()) {
                    setForm(f => ({ ...f, planNames: [...f.planNames, planInput.trim()] }));
                    setPlanInput('');
                  }
                }} 
                className="flex items-center justify-center px-4 py-2.5 bg-[#5B4BFF] hover:bg-[#4F3FE8] text-white rounded-[12px] font-bold shadow-[0_2px_8px_rgba(91,75,255,0.25)] hover:shadow-[0_4px_12px_rgba(91,75,255,0.35)] transition-all cursor-pointer flex-shrink-0"
                title="Add Plan Tier"
              >
                <HiPlus className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>
            {form.planNames.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.planNames.map((plan, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF2FF] text-[#5B4BFF] text-[12px] font-bold rounded-[10px] border border-[#C7D2FE]/60 shadow-xs">
                    <span>{plan}</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        setForm(f => ({ ...f, planNames: f.planNames.filter((_, i) => i !== idx) }));
                      }} 
                      className="text-[#94A3B8] hover:text-[#EF4444] transition-colors ml-1 p-0.5 rounded-full hover:bg-white"
                      title="Remove plan"
                    >
                      <HiTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Product Brand Logo (1:1 Square)</label>
            <div className="flex items-center gap-5">
              {previewUrl ? (
                <div className="w-20 h-20 rounded-[16px] bg-white border border-[#E2E8F0] flex items-center justify-center p-2 shadow-xs">
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-[16px] bg-indigo-50/50 border border-indigo-200 border-dashed flex items-center justify-center text-2xl">🖼️</div>
              )}
              <div className="flex-1">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} className="font-bold border-[#E2E8F0]">
                  {previewUrl ? 'Change Logo Image' : 'Upload Brand Logo'}
                </Button>
                <p className="text-[11.5px] text-[#94A3B8] mt-1.5">Cropper tool opens automatically. Max 2MB.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Catalog Status</label>
            <select 
              value={form.status} 
              onChange={e => setForm({...form, status: e.target.value})}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:bg-white focus:border-[#5B4BFF] focus:ring-4 focus:ring-[#5B4BFF]/10 rounded-[12px] px-4 py-2.5 text-[14px] font-bold text-[#0F172A] outline-none transition-all cursor-pointer"
            >
              <option value="active">Active (Visible to Sellers)</option>
              <option value="inactive">Inactive (Archived)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-3 border-t border-[#F1F5F9]">
            <Button type="button" variant="secondary" className="flex-1 font-bold" onClick={resetForm}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-[#5B4BFF] hover:bg-[#4E3EF0] text-white font-bold shadow-md shadow-[#5B4BFF]/25" isLoading={createMutation.isPending || updateMutation.isPending}>
              {productToEdit ? 'Save Changes' : 'Create Template'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!productToDelete} onClose={() => setProductToDelete(null)} title="Delete Master Product Template">
        <div className="flex flex-col items-center text-center p-3">
          <div className="w-16 h-16 rounded-[20px] bg-rose-50 border border-rose-200 flex items-center justify-center mb-5 text-rose-500 shadow-sm">
            <HiExclamation className="w-8 h-8" />
          </div>
          <h3 className="text-[20px] font-extrabold text-[#0F172A] mb-2">Delete {productToDelete?.name}?</h3>
          <p className="text-[#64748B] text-[14.5px] mb-7 leading-relaxed max-w-sm">
            Are you sure you want to delete this master product? If active listings are linked, the deletion will be blocked to maintain data integrity.
          </p>
          <div className="flex gap-3 w-full">
            <Button variant="secondary" className="flex-1 font-bold" onClick={() => setProductToDelete(null)}>Cancel</Button>
            <Button className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold" onClick={() => deleteMutation.mutate(productToDelete._id)} isLoading={deleteMutation.isPending}>
              Delete Template
            </Button>
          </div>
        </div>
      </Modal>

      {imageSrc && (
        <ImageCropperModal
          isOpen={!!imageSrc}
          onClose={() => setImageSrc(null)}
          imageSrc={imageSrc}
          onCropComplete={handleCropComplete}
          aspectRatio={1}
        />
      )}
    </div>
  );
};

export default ProductCatalog;
