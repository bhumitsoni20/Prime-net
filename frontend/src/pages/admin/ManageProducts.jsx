import { useState, useEffect, useMemo } from 'react';
import { getAllProducts, updateProductStatus, deleteProductAdmin } from '../../services/admin.service';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { 
  HiTrash, 
  HiExclamation, 
  HiClipboardCopy, 
  HiSearch, 
  HiOutlineCube, 
  HiOutlineCheckCircle, 
  HiOutlineClock, 
  HiOutlineBan, 
  HiOutlineExternalLink,
  HiOutlineFilter
} from 'react-icons/hi';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
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
    // Optimistic UI update: instantly change the status in the local state
    setProducts(prevProducts => 
      prevProducts.map(p => p._id === productId ? { ...p, status: newStatus } : p)
    );

    try {
      await updateProductStatus(productId, newStatus);
      toast.success('Product status updated');
    } catch (error) {
      // Revert the optimistic update on failure
      fetchProducts();
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

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [products]);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.status === 'active').length;
    const pending = products.filter(p => p.status === 'pending').length;
    const inactive = products.filter(p => p.status === 'inactive').length;
    return { total, active, pending, inactive };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch = 
        product.title?.toLowerCase().includes(searchStr) || 
        product.seller?.name?.toLowerCase().includes(searchStr) || 
        product.category?.toLowerCase().includes(searchStr) ||
        product._id?.toLowerCase().includes(searchStr);
      
      const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, searchQuery, selectedStatus, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[26px] font-extrabold text-[#0F172A] tracking-[-0.02em]">Manage Products</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF2FF] text-[#5B4BFF] border border-[#E0E7FF]">
              {products.length} Listings
            </span>
          </div>
          <p className="text-[#64748B] text-[14px]">Audit, verify, and moderate digital subscription listings across all sellers.</p>
        </div>
      </div>

      {/* KPI Stats Grid */}
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
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Awaiting moderation</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Inactive / Paused</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#F1F5F9] text-[#64748B] flex items-center justify-center">
              <HiOutlineBan className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#64748B]">{stats.inactive}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Hidden from store</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F8FAFC] border border-[#F1F5F9] rounded-[16px]">
            {[
              { id: 'all', label: 'All Products', count: stats.total },
              { id: 'active', label: 'Active', count: stats.active },
              { id: 'pending', label: 'Pending', count: stats.pending },
              { id: 'inactive', label: 'Inactive', count: stats.inactive }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-[12px] text-[13px] font-bold transition-all ${
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

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Category Filter */}
            <div className="relative w-full sm:w-[180px]">
              <HiOutlineFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-[14px] py-2.5 pl-10 pr-8 text-[13px] font-semibold text-[#0F172A] focus:outline-none focus:border-[#5B4BFF] focus:ring-4 focus:ring-[#5B4BFF]/10 transition-all cursor-pointer capitalize"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-[280px]">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search title, seller, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-[14px] py-2.5 pl-10 pr-4 text-[13px] font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#5B4BFF] focus:ring-4 focus:ring-[#5B4BFF]/10 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-left text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] bg-[#F8FAFC]">
                <th className="p-4 pl-6">Product Details</th>
                <th className="p-4">Seller Info</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Moderation Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-[#94A3B8] font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-[#5B4BFF] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-semibold">Loading platform listings...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-16 h-16 rounded-[20px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-2xl mb-4 shadow-sm">
                        📦
                      </div>
                      <h3 className="text-[17px] font-bold text-[#0F172A] mb-1">No products found</h3>
                      <p className="text-[13px] text-[#64748B] mb-4">No listings match your active filters or search criteria.</p>
                      {(searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all') && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedStatus('all');
                            setSelectedCategory('all');
                          }}
                        >
                          Reset Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product._id} className="hover:bg-[#F8FAFC] transition-colors group">
                    {/* Product Column */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3.5">
                        {product.logo ? (
                          <div className="w-11 h-11 rounded-[12px] border border-[#E2E8F0] bg-white shadow-sm overflow-hidden flex-shrink-0 p-1 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <img src={product.logo} className="w-full h-full object-contain" alt={product.title} />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] border border-[#C7D2FE] text-[#5B4BFF] flex items-center justify-center font-extrabold text-base shadow-sm flex-shrink-0">
                            {product.title?.charAt(0) || 'P'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-[14px] text-[#0F172A] group-hover:text-[#5B4BFF] transition-colors truncate max-w-[220px]">
                            {product.title}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(product._id);
                                toast.success('Product ID copied!');
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-mono text-[#94A3B8] hover:text-[#5B4BFF] transition-colors"
                              title="Click to copy full ID"
                            >
                              <HiClipboardCopy className="w-3 h-3" />
                              #{product._id.slice(-6)}
                            </button>
                            {product.duration && (
                              <span className="text-[11px] font-semibold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-[6px]">
                                {product.duration}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Seller Column */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#EEF2FF] border border-[#E0E7FF] text-[#5B4BFF] flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                          {product.seller?.name?.charAt(0) || 'S'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold text-[#0F172A] truncate max-w-[140px]">
                            {product.seller?.name || 'Unknown Seller'}
                          </div>
                          <div className="text-[11px] text-[#64748B] truncate max-w-[140px]">
                            {product.seller?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category Column */}
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-[8px] text-[12px] font-semibold bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] capitalize">
                        {product.category || 'General'}
                      </span>
                    </td>

                    {/* Price Column */}
                    <td className="p-4">
                      <div className="text-[15px] font-extrabold text-[#0F172A]">
                        ₹{Number(product.price || 0).toLocaleString('en-IN')}
                      </div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="text-[11px] text-[#94A3B8] line-through">
                          ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    {/* Status Column */}
                    <td className="p-4">
                      <div className="relative inline-block w-[130px]">
                        <select
                          className={`w-full appearance-none rounded-[10px] pl-3 pr-7 py-1.5 text-[12px] font-bold border transition-all cursor-pointer uppercase tracking-wider ${
                            product.status === 'active'
                              ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] focus:ring-[#10B981]/20'
                              : product.status === 'pending'
                              ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] focus:ring-[#F59E0B]/20'
                              : 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0] focus:ring-slate-200'
                          }`}
                          value={product.status}
                          onChange={(e) => handleStatusChange(product._id, e.target.value)}
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="inactive">Inactive</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-current opacity-70">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(product._id);
                            toast.success('Product ID copied to clipboard');
                          }}
                          className="p-2 text-[#64748B] hover:text-[#5B4BFF] hover:bg-[#EEF2FF] rounded-[10px] transition-colors"
                          title="Copy Product ID"
                        >
                          <HiClipboardCopy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="p-2 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-[10px] transition-colors"
                          title="Delete Product"
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!productToDelete} onClose={() => setProductToDelete(null)} title="Delete Listing">
        <div className="flex flex-col items-center text-center p-2">
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-[#EF4444] rounded-full blur-[20px] opacity-20"></div>
            <div className="w-16 h-16 rounded-[20px] bg-[#FEF2F2] flex items-center justify-center relative border border-[#FECACA]">
              <HiExclamation className="w-8 h-8 text-[#EF4444]" />
            </div>
          </div>
          <h3 className="text-[20px] font-extrabold text-[#0F172A] mb-2">Delete this product?</h3>
          <p className="text-[#64748B] text-[14px] mb-6 leading-relaxed max-w-sm">
            Are you sure you want to permanently remove <span className="font-bold text-[#0F172A]">{productToDelete?.title}</span>? This action cannot be reversed and will delist it from the marketplace immediately.
          </p>
          <div className="flex gap-3 w-full">
            <Button 
              variant="secondary" 
              size="lg" 
              className="flex-1 border-[#E2E8F0]" 
              onClick={() => setProductToDelete(null)} 
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              size="lg"
              className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] focus:ring-[#EF4444]/20 border-transparent text-white shadow-[0_4px_14px_rgba(239,68,68,0.25)]" 
              onClick={confirmDelete}
              isLoading={isDeleting}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageProducts;
