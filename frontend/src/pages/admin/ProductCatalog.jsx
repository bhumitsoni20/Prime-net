import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiPlus, HiTrash, HiExclamation, HiPencil } from 'react-icons/hi';
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
      toast.success('Master product created!');
      queryClient.invalidateQueries({ queryKey: ['masterProducts'] });
      resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create product')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => await api.put(`/master-products/${id}`, payload),
    onSuccess: () => {
      toast.success('Master product updated!');
      queryClient.invalidateQueries({ queryKey: ['masterProducts'] });
      resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update product')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/master-products/${id}`),
    onSuccess: () => {
      toast.success('Master product deleted!');
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
    setCroppedBlob(null); // No new image initially
    setProductToEdit(product);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Name is required');
    if (!previewUrl) return toast.error('Image is required');

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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em] mb-1">Product Catalog</h1>
          <p className="text-[#64748B] text-[15px]">Manage the master products available for marketplace listings.</p>
        </div>
        <Button size="lg" className="shadow-sm" onClick={() => setIsAddModalOpen(true)}>
          <HiPlus className="w-5 h-5 mr-1" /> Add Product
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="bg-white px-5 py-3 rounded-[16px] border border-[#E2E8F0] shadow-sm flex items-center gap-3">
          <div className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Total</div>
          <div className="text-[18px] font-extrabold text-[#0F172A]">{products.length}</div>
        </div>
        <div className="bg-white px-5 py-3 rounded-[16px] border border-[#E2E8F0] shadow-sm flex items-center gap-3">
          <div className="text-[12px] font-bold text-[#10B981] uppercase tracking-wider">Active</div>
          <div className="text-[18px] font-extrabold text-[#0F172A]">{activeCount}</div>
        </div>
        <div className="bg-white px-5 py-3 rounded-[16px] border border-[#E2E8F0] shadow-sm flex items-center gap-3">
          <div className="text-[12px] font-bold text-[#F59E0B] uppercase tracking-wider">Inactive</div>
          <div className="text-[18px] font-extrabold text-[#0F172A]">{inactiveCount}</div>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="p-5 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <Input 
            placeholder="Search catalog..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="max-w-md bg-white"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-left text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] bg-white">
                <th className="p-5 pl-6">Master Product</th>
                <th className="p-5">Status</th>
                <th className="p-5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr><td colSpan={3} className="p-12 text-center"><Spinner /></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={3} className="p-12 text-center text-[#64748B] font-medium bg-white">No products found.</td></tr>
              ) : (
                products.map(product => (
                  <tr key={product._id} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="p-5 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[14px] border border-[#E2E8F0] bg-white shadow-sm overflow-hidden flex-shrink-0 p-1.5">
                          <img src={product.imageUrl} className="w-full h-full object-contain" alt={product.name} />
                        </div>
                        <span className="font-bold text-[15px] text-[#0F172A]">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <Badge variant={product.status === 'active' ? 'success' : 'gray'}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="p-5 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(product)} className="p-2.5 text-[#64748B] hover:text-[#5B4BFF] hover:bg-[#EEF2FF] rounded-[10px] transition-colors">
                          <HiPencil className="w-[18px] h-[18px]" />
                        </button>
                        <button onClick={() => setProductToDelete(product)} className="p-2.5 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-[10px] transition-colors">
                          <HiTrash className="w-[18px] h-[18px]" />
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
      <Modal isOpen={isAddModalOpen || !!productToEdit} onClose={resetForm} title={productToEdit ? "Edit Master Product" : "Add Master Product"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Product Name" 
            placeholder="e.g. Netflix" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            required 
          />

          <div>
            <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-[0.08em]">Available Plan Names</label>
            <div className="flex gap-2 mb-3">
              <input 
                type="text"
                placeholder="e.g. Mobile Edition"
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
                className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-4 py-3 text-[#0F172A] focus:outline-none focus:border-[#5B4BFF] transition-all outline-none"
              />
              <Button type="button" onClick={() => {
                if (planInput.trim()) {
                  setForm(f => ({ ...f, planNames: [...f.planNames, planInput.trim()] }));
                  setPlanInput('');
                }
              }} className="px-4">
                <HiPlus className="w-5 h-5" />
              </Button>
            </div>
            {form.planNames.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.planNames.map((plan, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F5F9] text-[#475569] text-sm font-medium rounded-lg border border-[#E2E8F0]">
                    {plan}
                    <button type="button" onClick={() => {
                      setForm(f => ({ ...f, planNames: f.planNames.filter((_, i) => i !== idx) }));
                    }} className="text-[#94A3B8] hover:text-[#EF4444] transition-colors ml-1">
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-[13px] font-bold text-[#334155] mb-3 uppercase tracking-[0.08em]">Product Image</label>
            <div className="flex items-center gap-5">
              {previewUrl ? (
                <div className="w-20 h-20 rounded-[16px] bg-white border border-[#E2E8F0] flex items-center justify-center p-2">
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-[16px] bg-[#F8FAFC] border border-[#E2E8F0] border-dashed flex items-center justify-center text-2xl">🖼️</div>
              )}
              <div className="flex-1">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  {previewUrl ? 'Change Image' : 'Upload Image'}
                </Button>
                <p className="text-[12px] text-[#94A3B8] mt-2">Recommended: Square image (1:1), max 2MB.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-[0.08em]">Status</label>
            <select 
              value={form.status} 
              onChange={e => setForm({...form, status: e.target.value})}
              className="w-full bg-[#F8FAFC] border-transparent focus:bg-white border focus:border-[#5B4BFF] rounded-[16px] px-5 py-4 text-[15px] font-semibold text-[#0F172A] outline-none transition-all"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>Cancel</Button>
            <Button type="submit" className="flex-1" isLoading={createMutation.isPending || updateMutation.isPending}>
              {productToEdit ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!productToDelete} onClose={() => setProductToDelete(null)} title="Delete Master Product">
        <div className="flex flex-col items-center text-center p-2">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
            <HiExclamation className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-[#0F172A] mb-2">Delete {productToDelete?.name}?</h3>
          <p className="text-[#64748B] text-[15px] mb-8 max-w-[280px]">
            Are you sure? This cannot be undone. If this product is used in existing listings, deletion will be blocked.
          </p>
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setProductToDelete(null)}>Cancel</Button>
            <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={() => deleteMutation.mutate(productToDelete._id)} isLoading={deleteMutation.isPending}>
              Delete
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
