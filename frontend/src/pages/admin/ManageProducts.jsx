import { useState, useEffect } from 'react';
import { getAllProducts, updateProductStatus, deleteProductAdmin } from '../../services/admin.service';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { HiTrash, HiExclamation, HiClipboardCopy } from 'react-icons/hi';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await getAllProducts(1, 100);
      setProducts(response.data || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStatusChange = async (productId, newStatus) => {
    try {
      await updateProductStatus(productId, newStatus);
      toast.success('Product status updated');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProductAdmin(productToDelete._id);
      toast.success('Product deleted successfully');
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em] mb-1">Manage Products</h1>
          <p className="text-[#64748B] text-[15px]">View and moderate all products on the platform.</p>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-left text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] bg-[#F8FAFC]">
                <th className="p-5 pl-6">Product</th>
                <th className="p-5">Seller</th>
                <th className="p-5">Price</th>
                <th className="p-5">Status</th>
                <th className="p-5 pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-[#94A3B8] font-medium animate-pulse">Loading products...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-[#64748B] font-medium bg-[#F8FAFC]">No products found.</td></tr>
              ) : (
                products.map(product => (
                  <tr key={product._id} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="p-5 pl-6">
                      <div className="flex items-center gap-4">
                        {product.logo ? (
                          <div className="w-10 h-10 rounded-[10px] border border-[#E2E8F0] bg-white shadow-sm overflow-hidden flex-shrink-0 p-1">
                            <img src={product.logo} className="w-full h-full object-contain" alt="" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-[10px] bg-[#EEF2FF] border border-[#E0E7FF] text-[#5B4BFF] flex items-center justify-center font-extrabold text-lg shadow-sm flex-shrink-0">
                            {product.title?.charAt(0) || 'P'}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-[14px] text-[#0F172A] group-hover:text-[#5B4BFF] transition-colors block">{product.title}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(product._id);
                              toast.success('Product ID copied!');
                            }}
                            className="flex items-center gap-1 text-[11px] text-[#94A3B8] hover:text-[#5B4BFF] transition-colors mt-0.5"
                            title="Copy ID"
                          >
                            <HiClipboardCopy className="w-3.5 h-3.5" /> ID: {product._id}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-[14px] font-semibold text-[#475569]">{product.seller?.name || 'Unknown'}</td>
                    <td className="p-5 text-[15px] text-[#0F172A] font-extrabold">₹{product.price.toLocaleString()}</td>
                    <td className="p-5">
                      <Badge variant={product.status === 'active' ? 'success' : product.status === 'inactive' ? 'gray' : 'warning'}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="p-5 pr-6">
                      <div className="flex items-center gap-2">
                        <div className="relative w-[110px]">
                          <select
                            className="w-full appearance-none bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] px-3 py-2 pr-8 text-[12px] font-bold text-[#334155] focus:outline-none focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white transition-all cursor-pointer uppercase tracking-wider"
                            value={product.status}
                            onChange={(e) => handleStatusChange(product._id, e.target.value)}
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#94A3B8]">
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                          </div>
                        </div>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="p-2.5 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-[10px] transition-colors"
                          title="Delete Product"
                        >
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
            Are you sure you want to permanently delete this product? This action cannot be undone and will remove it from the marketplace entirely.
          </p>
          <div className="flex gap-4 w-full">
            <Button variant="secondary" size="lg" className="flex-1 border-[#E2E8F0]" onClick={() => setProductToDelete(null)} disabled={isDeleting}>Cancel</Button>
            <Button 
              size="lg"
              className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] focus:ring-[#EF4444]/20 border-transparent text-white shadow-[0_4px_14px_rgba(239,68,68,0.3)]" 
              onClick={confirmDelete}
              isLoading={isDeleting}
            >
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageProducts;
