import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { 
  HiOutlinePlus, 
  HiSearch, 
  HiOutlineTrash, 
  HiOutlineTicket, 
  HiOutlineSparkles,
  HiClipboardCopy,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineLightningBolt
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    maxUsage: 10
  });

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: async () => {
      const res = await api.get('/coupons');
      return res.data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/coupons', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      setIsModalOpen(false);
      setFormData({ code: '', discountType: 'percentage', discountValue: '', maxUsage: 10 });
      toast.success('Coupon created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.patch(`/coupons/${id}/toggle`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      toast.success('Coupon status updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update coupon status');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/coupons/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      toast.success('Coupon deleted');
      setCouponToDelete(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete coupon');
      setCouponToDelete(null);
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) {
      return toast.error('Please complete all coupon fields');
    }
    
    createMutation.mutate({
      ...formData,
      discountValue: Number(formData.discountValue),
      maxUsage: Number(formData.maxUsage)
    });
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'STREAM';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter(c => c.isActive && (c.usageCount < c.maxUsage)).length;
    const totalRedemptions = coupons.reduce((acc, c) => acc + (c.usageCount || 0), 0);
    const maxedOut = coupons.filter(c => c.usageCount >= c.maxUsage).length;
    return { total, active, totalRedemptions, maxedOut };
  }, [coupons]);

  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = 
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && c.isActive && (c.usageCount < c.maxUsage)) ||
        (selectedStatus === 'inactive' && (!c.isActive || c.usageCount >= c.maxUsage));

      return matchesSearch && matchesStatus;
    });
  }, [coupons, searchTerm, selectedStatus]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Spinner size="lg" />
        <span className="text-sm font-semibold text-[#64748B]">Loading discount coupons...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[26px] font-extrabold text-[#0F172A] tracking-[-0.02em]">Manage Coupons</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF2FF] text-[#5B4BFF] border border-[#E0E7FF]">
              {coupons.length} Promo Codes
            </span>
          </div>
          <p className="text-[#64748B] text-[14px]">Create promotional discount vouchers and monitor user redemptions.</p>
        </div>

        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center gap-2 bg-[#5B4BFF] hover:bg-[#4B3BE6] text-white shadow-[0_4px_14px_rgba(91,75,255,0.25)] rounded-[14px] px-5 py-2.5 font-bold text-[14px]"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Create Coupon
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Total Coupons</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#EEF2FF] text-[#5B4BFF] flex items-center justify-center">
              <HiOutlineTicket className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#0F172A]">{stats.total}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Generated campaigns</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Active & Usable</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <HiOutlineCheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#10B981]">{stats.active}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Ready for checkout</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Total Uses</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#EEF2FF] text-[#5B4BFF] flex items-center justify-center">
              <HiOutlineLightningBolt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#5B4BFF]">{stats.totalRedemptions}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Total buyer claims</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Fully Exhausted</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center">
              <HiOutlineExclamation className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#EF4444]">{stats.maxedOut}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Reached max usage</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F8FAFC] border border-[#F1F5F9] rounded-[16px] overflow-x-auto">
            {[
              { id: 'all', label: 'All Coupons', count: stats.total },
              { id: 'active', label: 'Active', count: stats.active },
              { id: 'inactive', label: 'Exhausted / Off', count: stats.total - stats.active }
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
              placeholder="Search coupon code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-[14px] py-2.5 pl-10 pr-4 text-[13px] font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#5B4BFF] focus:ring-4 focus:ring-[#5B4BFF]/10 focus:bg-white transition-all uppercase"
            />
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] text-left">
                <th className="p-4 pl-6">Coupon Code</th>
                <th className="p-4">Discount Value</th>
                <th className="p-4">Usage Progress</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-16 h-16 rounded-[20px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-2xl mb-4 shadow-sm">
                        🎟️
                      </div>
                      <h3 className="text-[17px] font-bold text-[#0F172A] mb-1">No coupons found</h3>
                      <p className="text-[13px] text-[#64748B] mb-4">
                        {searchTerm || selectedStatus !== 'all' ? 'No coupons match your filter criteria.' : 'Create your first discount coupon above.'}
                      </p>
                      {(searchTerm || selectedStatus !== 'all') && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedStatus('all');
                          }}
                        >
                          Reset Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const usagePct = Math.min(100, Math.round(((coupon.usageCount || 0) / (coupon.maxUsage || 1)) * 100));
                  const isExhausted = (coupon.usageCount || 0) >= (coupon.maxUsage || 1);

                  return (
                    <tr key={coupon._id} className="hover:bg-[#F8FAFC] transition-colors group">
                      {/* Code */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[12px] bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#5B4BFF] flex-shrink-0">
                            <HiOutlineTicket className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-extrabold text-[15px] text-[#0F172A] tracking-wider group-hover:text-[#5B4BFF] transition-colors">
                                {coupon.code}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(coupon.code);
                                  toast.success('Coupon code copied!');
                                }}
                                className="text-[#94A3B8] hover:text-[#5B4BFF] transition-colors p-1"
                                title="Copy code"
                              >
                                <HiClipboardCopy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[11px] text-[#64748B] capitalize">
                              {coupon.discountType} discount
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Discount Value */}
                      <td className="p-4">
                        <div className="inline-flex items-center px-3 py-1 rounded-[10px] bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] font-extrabold text-[14px]">
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT`}
                        </div>
                      </td>

                      {/* Usage */}
                      <td className="p-4 min-w-[180px]">
                        <div className="flex items-center justify-between text-[12px] mb-1.5">
                          <span className="font-bold text-[#0F172A]">
                            {coupon.usageCount || 0} / {coupon.maxUsage} used
                          </span>
                          <span className={`font-semibold ${isExhausted ? 'text-[#EF4444]' : 'text-[#64748B]'}`}>
                            {usagePct}%
                          </span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isExhausted ? 'bg-[#EF4444]' : usagePct > 75 ? 'bg-[#F59E0B]' : 'bg-[#5B4BFF]'
                            }`}
                            style={{ width: `${usagePct}%` }}
                          />
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleMutation.mutate(coupon._id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase transition-all border ${
                            coupon.isActive && !isExhausted
                              ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] hover:bg-[#D1FAE5]'
                              : 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0] hover:bg-[#E2E8F0]'
                          }`}
                          title="Click to toggle status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            coupon.isActive && !isExhausted ? 'bg-[#10B981]' : 'bg-[#94A3B8]'
                          }`} />
                          {isExhausted ? 'Exhausted' : coupon.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-[13px] font-medium text-[#64748B]">
                        {new Date(coupon.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => setCouponToDelete(coupon)}
                          className="p-2 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-[10px] transition-colors"
                          title="Delete Coupon"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Promotional Coupon"
      >
        <form onSubmit={handleCreate} className="space-y-5 p-1">
          {/* Code Input + Generator */}
          <div>
            <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Coupon Code
            </label>
            <div className="flex gap-2">
              <input
                required
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. MEGA50"
                className="flex-1 uppercase font-mono font-bold tracking-wider px-4 py-2.5 rounded-[14px] border border-[#E2E8F0] focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] outline-none text-[14px] text-[#0F172A]"
              />
              <Button 
                type="button" 
                variant="secondary" 
                onClick={generateRandomCode}
                className="flex items-center gap-1.5 font-bold text-[13px] border-[#E2E8F0]"
              >
                <HiOutlineSparkles className="w-4 h-4 text-[#5B4BFF]" /> Generate
              </Button>
            </div>
          </div>

          {/* Discount Type Radio Selection Cards */}
          <div>
            <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Discount Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, discountType: 'percentage' })}
                className={`p-3.5 rounded-[16px] border text-left transition-all ${
                  formData.discountType === 'percentage'
                    ? 'border-[#5B4BFF] bg-[#EEF2FF]/60 ring-2 ring-[#5B4BFF]/20'
                    : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="font-extrabold text-[14px] text-[#0F172A] mb-0.5">Percentage (%)</div>
                <div className="text-[12px] text-[#64748B]">e.g. 20% off order total</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, discountType: 'fixed' })}
                className={`p-3.5 rounded-[16px] border text-left transition-all ${
                  formData.discountType === 'fixed'
                    ? 'border-[#5B4BFF] bg-[#EEF2FF]/60 ring-2 ring-[#5B4BFF]/20'
                    : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="font-extrabold text-[14px] text-[#0F172A] mb-0.5">Fixed Cash (₹)</div>
                <div className="text-[12px] text-[#64748B]">e.g. ₹100 flat reduction</div>
              </button>
            </div>
          </div>

          {/* Discount Value & Max Usage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                {formData.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Cash (₹)'}
              </label>
              <input
                required
                type="number"
                min="1"
                max={formData.discountType === 'percentage' ? 100 : undefined}
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                placeholder={formData.discountType === 'percentage' ? 'e.g. 25' : 'e.g. 150'}
                className="w-full px-4 py-2.5 rounded-[14px] border border-[#E2E8F0] focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] outline-none text-[14px] font-semibold text-[#0F172A]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                Max Usage Limit
              </label>
              <input
                required
                type="number"
                min="1"
                value={formData.maxUsage}
                onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
                placeholder="e.g. 50"
                className="w-full px-4 py-2.5 rounded-[14px] border border-[#E2E8F0] focus:ring-4 focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] outline-none text-[14px] font-semibold text-[#0F172A]"
              />
            </div>
          </div>

          {/* Coupon Live Preview Card */}
          <div className="p-4 rounded-[16px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-[#EEF2FF] text-[#5B4BFF] flex items-center justify-center font-bold text-lg shadow-sm">
                🎟️
              </div>
              <div>
                <div className="font-mono font-extrabold text-[14px] text-[#0F172A]">
                  {formData.code || 'COUPON_CODE'}
                </div>
                <div className="text-[12px] text-[#64748B]">
                  Max {formData.maxUsage || 1} redemptions globally
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex px-3 py-1 rounded-[8px] bg-[#F0FDF4] text-[#16A34A] font-extrabold text-[13px] border border-[#BBF7D0]">
                {formData.discountValue 
                  ? (formData.discountType === 'percentage' ? `${formData.discountValue}% OFF` : `₹${formData.discountValue} OFF`)
                  : '0% OFF'
                }
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 flex justify-end gap-3 border-t border-[#E2E8F0]">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={createMutation.isPending}
              className="bg-[#5B4BFF] hover:bg-[#4B3BE6] text-white shadow-[0_4px_14px_rgba(91,75,255,0.25)]"
            >
              Publish Coupon
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!couponToDelete} onClose={() => setCouponToDelete(null)} title="Delete Coupon">
        <div className="flex flex-col items-center text-center p-2">
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-[#EF4444] rounded-full blur-[20px] opacity-20"></div>
            <div className="w-16 h-16 rounded-[20px] bg-[#FEF2F2] flex items-center justify-center relative border border-[#FECACA]">
              <HiOutlineExclamation className="w-8 h-8 text-[#EF4444]" />
            </div>
          </div>
          <h3 className="text-[20px] font-extrabold text-[#0F172A] mb-2">Delete Coupon {couponToDelete?.code}?</h3>
          <p className="text-[#64748B] text-[14px] mb-6 leading-relaxed max-w-sm">
            Are you sure you want to permanently delete this discount code? Any active buyer checkout applying this code will no longer receive the discount.
          </p>
          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1 border-[#E2E8F0]"
              onClick={() => setCouponToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] border-transparent text-white shadow-[0_4px_14px_rgba(239,68,68,0.25)]"
              onClick={() => deleteMutation.mutate(couponToDelete._id)}
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

export default AdminCoupons;
