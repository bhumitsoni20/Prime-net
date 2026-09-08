import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { 
  HiPlus, 
  HiPencil, 
  HiTrash, 
  HiExclamation, 
  HiSearch, 
  HiClipboardCopy,
  HiOutlineCube,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineBan
} from 'react-icons/hi';
import { useSellerProducts, useDeleteProduct } from '../../hooks/useProducts';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const SellerProducts = () => {
  const { data, isLoading } = useSellerProducts();
  const deleteMutation = useDeleteProduct();
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const products = data?.data || [];

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.status === 'active').length;
    const pending = products.filter(p => p.status === 'pending').length;
    const inactive = products.filter(p => p.status !== 'active' && p.status !== 'pending').length;
    return { total, active, pending, inactive };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        product.title?.toLowerCase().includes(q) ||
        product.category?.toLowerCase().includes(q) ||
        product._id?.toLowerCase().includes(q);
      
      const matchesStatus = 
        selectedStatus === 'all' || 
        product.status === selectedStatus ||
        (selectedStatus === 'inactive' && product.status !== 'active' && product.status !== 'pending');

      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, selectedStatus]);

  const confirmDelete = () => {
    if (!productToDelete) return;
    
    deleteMutation.mutate(productToDelete._id, {
      onSuccess: () => {
        toast.success('Product deleted successfully');
        setProductToDelete(null);
      },
      onError: (err) => {
        toast.error(err?.message || 'Failed to delete product');
        setProductToDelete(null);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Spinner size="lg" />
        <span className="text-sm font-semibold text-[#64748B]">Loading your inventory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[26px] font-extrabold text-[#0F172A] tracking-[-0.02em]">My Inventory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF2FF] text-[#5B4BFF] border border-[#E0E7FF]">
              {products.length} Items Listed
            </span>
          </div>
          <p className="text-[#64748B] text-[14px]">Manage your active digital subscription listings, pricing, and stock.</p>
        </div>

        <Link to="/seller/products/new">
          <Button size="md" className="shadow-[0_4px_14px_rgba(91,75,255,0.25)] flex items-center gap-1.5 font-bold">
            <HiPlus className="w-4 h-4" /> Add Product
          </Button>
        </Link>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Total Listings</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#EEF2FF] text-[#5B4BFF] flex items-center justify-center">
              <HiOutlineCube className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#0F172A]">{stats.total}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Across all categories</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Active & Live</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <HiOutlineCheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#10B981]">{stats.active}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Discoverable by buyers</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Pending Review</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center">
              <HiOutlineClock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#F59E0B]">{stats.pending}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Awaiting admin review</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Sold / Paused</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#F1F5F9] text-[#64748B] flex items-center justify-center">
              <HiOutlineBan className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#64748B]">{stats.inactive}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Out of stock or paused</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F8FAFC] border border-[#F1F5F9] rounded-[16px] overflow-x-auto">
            {[
              { id: 'all', label: 'All Listings', count: stats.total },
              { id: 'active', label: 'Active', count: stats.active },
              { id: 'pending', label: 'Pending', count: stats.pending },
              { id: 'inactive', label: 'Sold / Paused', count: stats.inactive }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-[12px] text-[13px] font-bold transition-all whitespace-nowrap ${
                  selectedStatus === tab.id
                    ? 'bg-white text-[#5B4BFF] shadow-sm border border-[#E2E8F0]'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  selectedStatus === tab.id
                    ? 'bg-[#EEF2FF] text-[#5B4BFF]'
                    : 'bg-[#E2E8F0] text-[#64748B]'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-[280px]">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search title, category, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-[14px] py-2.5 pl-10 pr-4 text-[13px] font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#5B4BFF] focus:ring-4 focus:ring-[#5B4BFF]/10 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-16 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="w-16 h-16 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[20px] flex items-center justify-center mx-auto mb-4 shadow-sm text-2xl">
            📦
          </div>
          <h3 className="text-[18px] font-bold text-[#0F172A] mb-1.5">No Products Found</h3>
          <p className="text-[#64748B] text-[14px] max-w-sm mx-auto mb-5">
            {searchQuery || selectedStatus !== 'all'
              ? 'No products match your search or filter criteria.'
              : 'Your inventory is currently empty. Start selling by adding your first product.'}
          </p>
          <Link to="/seller/products/new">
            <Button size="md" className="shadow-[0_4px_14px_rgba(91,75,255,0.25)]">
              + Add First Product
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">
                  <th className="p-4 pl-6">Product Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredProducts.map(product => (
                  <tr key={product._id} className="hover:bg-[#F8FAFC] transition-colors group">
                    {/* Title & Logo */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3.5">
                        {product.logo ? (
                          <div className="w-11 h-11 rounded-[12px] border border-[#E2E8F0] bg-white shadow-xs overflow-hidden flex-shrink-0 p-1 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <img src={product.logo} alt={product.title} className="max-w-full max-h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] border border-[#C7D2FE] text-[#5B4BFF] flex items-center justify-center font-extrabold text-base shadow-xs flex-shrink-0">
                            {product.title?.charAt(0) || 'P'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-[14px] text-[#0F172A] group-hover:text-[#5B4BFF] transition-colors block truncate max-w-[220px]">
                            {product.title}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(product._id);
                              toast.success('Product ID copied!');
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-[#94A3B8] hover:text-[#5B4BFF] transition-colors mt-0.5"
                            title="Copy ID"
                          >
                            <HiClipboardCopy className="w-3 h-3" />
                            #{product._id.slice(-6)}
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-[8px] text-[12px] font-semibold bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] capitalize">
                        {product.category || 'General'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <div className="text-[15px] font-extrabold text-[#0F172A]">
                        ₹{Number(product.price || 0).toLocaleString('en-IN')}
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="p-4">
                      <span className="text-[12px] font-semibold text-[#64748B] bg-[#F1F5F9] px-2.5 py-1 rounded-[8px]">
                        {product.duration || 'Standard'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border ${
                        product.status === 'active'
                          ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                          : product.status === 'pending'
                          ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                          : 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          product.status === 'active' ? 'bg-[#10B981]' : product.status === 'pending' ? 'bg-[#F59E0B]' : 'bg-[#94A3B8]'
                        }`}></span>
                        {product.status || 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link 
                          to={`/seller/products/${product._id}/edit`} 
                          className="p-2 text-[#64748B] hover:text-[#5B4BFF] hover:bg-[#EEF2FF] rounded-[10px] transition-colors"
                          title="Edit Listing"
                        >
                          <HiPencil className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => setProductToDelete(product)} 
                          className="p-2 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-[10px] transition-colors"
                          title="Delete Listing"
                        >
                          <HiTrash className="w-4 h-4" />
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
      <Modal isOpen={!!productToDelete} onClose={() => setProductToDelete(null)} title="Delete Listing">
        <div className="flex flex-col items-center text-center p-2">
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-[#EF4444] rounded-full blur-[20px] opacity-20"></div>
            <div className="w-16 h-16 rounded-[20px] bg-[#FEF2F2] flex items-center justify-center relative border border-[#FECACA]">
              <HiExclamation className="w-8 h-8 text-[#EF4444]" />
            </div>
          </div>
          <h3 className="text-[20px] font-extrabold text-[#0F172A] mb-2">Delete {productToDelete?.title}?</h3>
          <p className="text-[#64748B] text-[14px] mb-6 leading-relaxed max-w-sm">
            Are you sure you want to permanently delete this listing from your store? This action cannot be reversed.
          </p>
          <div className="flex gap-3 w-full">
            <Button 
              variant="secondary" 
              size="lg" 
              className="flex-1 border-[#E2E8F0]" 
              onClick={() => setProductToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              size="lg"
              className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] border-transparent text-white shadow-[0_4px_14px_rgba(239,68,68,0.25)]" 
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
