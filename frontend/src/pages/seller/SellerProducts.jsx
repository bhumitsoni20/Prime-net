import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { HiPlus, HiPencil, HiTrash, HiExclamation } from 'react-icons/hi';
import { useSellerProducts, useDeleteProduct } from '../../hooks/useProducts';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const SellerProducts = () => {
  const { data, isLoading } = useSellerProducts();
  const deleteMutation = useDeleteProduct();
  const [productToDelete, setProductToDelete] = useState(null);

  const confirmDelete = () => {
    if (!productToDelete) return;
    
    deleteMutation.mutate(productToDelete._id, {
      onSuccess: () => {
        toast.success('Product deleted successfully');
        setProductToDelete(null);
      },
      onError: () => {
        toast.error('Failed to delete product');
        setProductToDelete(null);
      }
    });
  };

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  const products = data?.data || [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em]">My Products</h1>
        <Link to="/seller/products/new">
          <Button size="lg" className="shadow-[0_4px_14px_rgba(91,75,255,0.3)]">
            <HiPlus className="w-[18px] h-[18px] mr-1.5" /> Add Product
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-12 text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="w-20 h-20 bg-[#F8FAFC] border border-[#F1F5F9] rounded-[20px] flex items-center justify-center mx-auto mb-5 shadow-sm text-3xl">📦</div>
          <h3 className="text-[20px] font-bold text-[#0F172A] mb-2">No Products Yet</h3>
          <p className="text-[#64748B] text-[15px] mb-6 max-w-sm mx-auto">Your products will appear here. Start by adding your first product.</p>
          <Link to="/seller/products/new"><Button variant="outline">Add First Product</Button></Link>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">
                <th className="p-5 pl-6">Product</th>
                <th className="p-5">Category</th>
                <th className="p-5">Price</th>
                <th className="p-5">Status</th>
                <th className="p-5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {products.map(product => (
                <tr key={product._id} className="hover:bg-[#F8FAFC] transition-colors group">
                  <td className="p-5 pl-6 text-sm font-medium text-[#0F172A]">
                    <div className="flex items-center gap-4">
                      {product.logo ? (
                        <div className="w-12 h-12 rounded-[14px] border border-[#E2E8F0] bg-white shadow-sm overflow-hidden flex-shrink-0 p-1">
                          <img src={product.logo} alt={product.title} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-[14px] bg-[#EEF2FF] border border-[#E0E7FF] text-[#5B4BFF] flex items-center justify-center font-extrabold text-xl shadow-sm flex-shrink-0">{product.title.charAt(0)}</div>
                      )}
                      <span className="font-bold text-[15px] group-hover:text-[#5B4BFF] transition-colors">{product.title}</span>
                    </div>
                  </td>
                  <td className="p-5 text-[14px] font-medium text-[#64748B]">{product.category}</td>
                  <td className="p-5 text-[15px] font-extrabold text-[#0F172A]">₹{product.price.toLocaleString()}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] shadow-sm ${product.status === 'active' ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]' : 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'}`}>
                      {product.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-5 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/seller/products/${product._id}/edit`} className="inline-flex p-2.5 text-[#64748B] hover:text-[#5B4BFF] hover:bg-[#EEF2FF] rounded-[10px] transition-colors">
                        <HiPencil className="w-[18px] h-[18px]" />
                      </Link>
                      <button onClick={() => setProductToDelete(product)} className="p-2.5 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-[10px] transition-colors">
                        <HiTrash className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!productToDelete} onClose={() => setProductToDelete(null)} title="Delete Product">
        <div className="flex flex-col items-center text-center p-2">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#EF4444] rounded-full blur-[24px] opacity-20"></div>
            <div className="w-16 h-16 rounded-[20px] bg-[#FEF2F2] flex items-center justify-center relative border border-[#FECACA]">
              <HiExclamation className="w-8 h-8 text-[#EF4444]" />
            </div>
          </div>
          <h3 className="text-[20px] font-extrabold text-[#0F172A] mb-3">Delete {productToDelete?.title}?</h3>
          <p className="text-[#64748B] text-[15px] mb-8 leading-relaxed">
            Are you sure you want to permanently delete this product? This action cannot be undone.
          </p>
          <div className="flex gap-4 w-full">
            <Button variant="secondary" size="lg" className="flex-1 border-[#E2E8F0]" onClick={() => setProductToDelete(null)}>Cancel</Button>
            <Button 
              size="lg"
              className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] focus:ring-[#EF4444]/20 border-transparent text-white shadow-[0_4px_14px_rgba(239,68,68,0.3)]" 
              onClick={confirmDelete}
              isLoading={deleteMutation.isPending}
            >
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SellerProducts;
