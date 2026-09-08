import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { 
  HiCheckCircle, 
  HiXCircle, 
  HiTrash, 
  HiExclamation, 
  HiSearch, 
  HiOutlineGift, 
  HiOutlineTag, 
  HiOutlineCheckCircle, 
  HiOutlineBan,
  HiClipboardCopy
} from 'react-icons/hi';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminBundles = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const queryClient = useQueryClient();
  const [bundleToDelete, setBundleToDelete] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminBundles'],
    queryFn: async () => {
      const res = await api.get('/bundles/admin');
      return res;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.put(`/bundles/${id}`, { status });
    },
    onSuccess: () => {
      toast.success('Bundle status updated');
      queryClient.invalidateQueries({ queryKey: ['adminBundles'] });
      queryClient.invalidateQueries({ queryKey: ['publicBundles'] });
      queryClient.invalidateQueries({ queryKey: ['sellerBundles'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update bundle');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/bundles/${id}`);
    },
    onSuccess: () => {
      toast.success('Bundle deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['adminBundles'] });
      queryClient.invalidateQueries({ queryKey: ['publicBundles'] });
      queryClient.invalidateQueries({ queryKey: ['sellerBundles'] });
      setBundleToDelete(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete bundle');
      setBundleToDelete(null);
    }
  });

  const bundles = data?.data || [];

  const stats = useMemo(() => {
    const total = bundles.length;
    const active = bundles.filter(b => b.status === 'active').length;
    const pending = bundles.filter(b => b.status === 'pending').length;
    const inactive = bundles.filter(b => b.status === 'inactive').length;
    return { total, active, pending, inactive };
  }, [bundles]);

  const filteredBundles = useMemo(() => {
    return bundles.filter(bundle => {
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch = 
        bundle.title?.toLowerCase().includes(searchStr) || 
        bundle.seller?.name?.toLowerCase().includes(searchStr) ||
        bundle.seller?.email?.toLowerCase().includes(searchStr) ||
        bundle.category?.toLowerCase().includes(searchStr) ||
        bundle._id?.toLowerCase().includes(searchStr);
      
      const matchesStatus = selectedStatus === 'all' || bundle.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [bundles, searchQuery, selectedStatus]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Spinner size="lg" />
        <span className="text-sm font-semibold text-[#64748B]">Loading bundle catalogs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[26px] font-extrabold text-[#0F172A] tracking-[-0.02em]">Manage Bundles</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF2FF] text-[#5B4BFF] border border-[#E0E7FF]">
              {bundles.length} Packages
            </span>
          </div>
          <p className="text-[#64748B] text-[14px]">Review multi-product subscription combo packages created by sellers.</p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Total Bundles</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#EEF2FF] text-[#5B4BFF] flex items-center justify-center">
              <HiOutlineGift className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#0F172A]">{stats.total}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Multi-item packages</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Active Deals</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <HiOutlineCheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#10B981]">{stats.active}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Live in store</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Pending Review</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center">
              <HiOutlineTag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#F59E0B]">{stats.pending}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Needs verification</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Inactive</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#F1F5F9] text-[#64748B] flex items-center justify-center">
              <HiOutlineBan className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#64748B]">{stats.inactive}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Paused or delisted</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F8FAFC] border border-[#F1F5F9] rounded-[16px] overflow-x-auto">
            {[
              { id: 'all', label: 'All Bundles', count: stats.total },
              { id: 'active', label: 'Active', count: stats.active },
              { id: 'inactive', label: 'Inactive', count: stats.inactive }
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
          <div className="relative w-full sm:w-[300px]">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search bundle, seller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-[14px] py-2.5 pl-10 pr-4 text-[13px] font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#5B4BFF] focus:ring-4 focus:ring-[#5B4BFF]/10 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Bundles Table */}
      {filteredBundles.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-16 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="w-16 h-16 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[20px] flex items-center justify-center mx-auto mb-4 shadow-sm text-2xl">
            🎁
          </div>
          <h3 className="text-[18px] font-bold text-[#0F172A] mb-1.5">No Bundles Found</h3>
          <p className="text-[#64748B] text-[14px] max-w-sm mx-auto mb-5">
            {searchQuery || selectedStatus !== 'all'
              ? 'No bundles match your active search or filters.'
              : 'No bundle packages have been published yet.'}
          </p>
          {(searchQuery || selectedStatus !== 'all') && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">
                  <th className="p-4 pl-6">Bundle Details</th>
                  <th className="p-4">Seller</th>
                  <th className="p-4">Bundle Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredBundles.map(bundle => (
                  <tr key={bundle._id} className="hover:bg-[#F8FAFC] transition-colors group">
                    {/* Bundle Info */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3.5">
                        {bundle.thumbnail ? (
                          <img
                            src={bundle.thumbnail}
                            alt={bundle.title}
                            className="w-11 h-11 rounded-[12px] object-cover border border-[#E2E8F0] shadow-sm bg-white flex-shrink-0 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] border border-[#C7D2FE] flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                            🎁
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-[#0F172A] text-[14px] group-hover:text-[#5B4BFF] transition-colors truncate max-w-[240px]">
                            {bundle.title}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-semibold text-[#5B4BFF] bg-[#EEF2FF] px-2 py-0.5 rounded-[6px] capitalize">
                              {bundle.category || 'Package'}
                            </span>
                            {bundle.items?.length > 0 && (
                              <span className="text-[11px] font-medium text-[#64748B]">
                                {bundle.items.length} items
                              </span>
                            )}
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(bundle._id);
                                toast.success('Bundle ID copied!');
                              }}
                              className="text-[11px] font-mono text-[#94A3B8] hover:text-[#5B4BFF] transition-colors"
                              title="Copy ID"
                            >
                              #{bundle._id?.slice(-6)}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Seller Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={bundle.seller?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(bundle.seller?.name || 'Seller')}&background=EEF2FF&color=5B4BFF`}
                          alt={bundle.seller?.name}
                          className="w-8 h-8 rounded-full border border-[#E2E8F0] object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-[#0F172A] text-[13px] truncate max-w-[140px]">
                            {bundle.seller?.name || 'Unknown'}
                          </div>
                          <div className="text-[11px] text-[#64748B] truncate max-w-[140px]">
                            {bundle.seller?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <div className="text-[15px] font-extrabold text-[#0F172A]">
                        ₹{Number(bundle.bundlePrice || 0).toLocaleString('en-IN')}
                      </div>
                      {bundle.originalPrice && bundle.originalPrice > bundle.bundlePrice && (
                        <div className="text-[11px] text-[#94A3B8] line-through">
                          ₹{Number(bundle.originalPrice).toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border ${
                        bundle.status === 'active'
                          ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                          : bundle.status === 'pending'
                          ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                          : 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          bundle.status === 'active' ? 'bg-[#10B981]' : bundle.status === 'pending' ? 'bg-[#F59E0B]' : 'bg-[#94A3B8]'
                        }`}></span>
                        {bundle.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {bundle.status !== 'active' ? (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: bundle._id, status: 'active' })}
                            className="p-2 text-[#64748B] hover:text-[#10B981] hover:bg-[#ECFDF5] rounded-[10px] transition-colors"
                            title="Activate Bundle"
                          >
                            <HiCheckCircle className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: bundle._id, status: 'inactive' })}
                            className="p-2 text-[#64748B] hover:text-[#F59E0B] hover:bg-[#FFFBEB] rounded-[10px] transition-colors"
                            title="Deactivate Bundle"
                          >
                            <HiXCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => setBundleToDelete(bundle)}
                          className="p-2 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-[10px] transition-colors"
                          title="Delete Bundle"
                        >
                          <HiTrash className="w-5 h-5" />
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
      <Modal isOpen={!!bundleToDelete} onClose={() => setBundleToDelete(null)} title="Delete Bundle">
        <div className="flex flex-col items-center text-center p-2">
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-[#EF4444] rounded-full blur-[20px] opacity-20"></div>
            <div className="w-16 h-16 rounded-[20px] bg-[#FEF2F2] flex items-center justify-center relative border border-[#FECACA]">
              <HiExclamation className="w-8 h-8 text-[#EF4444]" />
            </div>
          </div>
          <h3 className="text-[20px] font-extrabold text-[#0F172A] mb-2">Delete this bundle?</h3>
          <p className="text-[#64748B] text-[14px] mb-6 leading-relaxed max-w-sm">
            Are you sure you want to delete <span className="font-bold text-[#0F172A]">{bundleToDelete?.title}</span>? This will permanently remove this combo deal from the marketplace.
          </p>
          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1 border-[#E2E8F0]"
              onClick={() => setBundleToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] border-transparent text-white shadow-[0_4px_14px_rgba(239,68,68,0.25)]"
              onClick={() => deleteMutation.mutate(bundleToDelete._id)}
              isLoading={deleteMutation.isPending}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminBundles;
