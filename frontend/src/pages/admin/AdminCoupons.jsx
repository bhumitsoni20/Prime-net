import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import PageLoader from '../../components/ui/PageLoader';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineTrash, HiOutlineTicket } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    maxUsage: 1
  });

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: async () => {
      const res = await api.get('/coupons');
      return res.data;
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
      setFormData({ code: '', discountType: 'percentage', discountValue: '', maxUsage: 1 });
      toast.success('Coupon created successfully');
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
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) return toast.error('Please fill all fields');
    
    // Auto convert value to number
    createMutation.mutate({
      ...formData,
      discountValue: Number(formData.discountValue),
      maxUsage: Number(formData.maxUsage)
    });
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'STREAM';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  if (isLoading) return <PageLoader />;

  const filteredCoupons = coupons?.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Coupons</h1>
          <p className="text-sm text-gray-500">Create and manage discount codes</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <HiOutlinePlus className="w-5 h-5" />
          Create Coupon
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCoupons?.map((coupon) => (
                <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-[#F1F5F9] flex items-center justify-center">
                        <HiOutlineTicket className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="font-semibold text-gray-900">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                    </span>
                    <span className="text-xs text-gray-500 ml-1 block capitalize">{coupon.discountType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">{coupon.usageCount}</span>
                      <span className="text-gray-500"> / {coupon.maxUsage}</span>
                    </div>
                    {coupon.usageCount >= coupon.maxUsage && (
                      <span className="text-xs text-red-500 font-medium">Fully Used</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => toggleMutation.mutate(coupon._id)} className="focus:outline-none">
                      <Badge variant={coupon.isActive ? 'success' : 'error'}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(coupon.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this coupon?')) deleteMutation.mutate(coupon._id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCoupons?.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No coupons found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Coupon"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
            <div className="flex gap-2">
              <Input
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. WELCOME50"
                className="uppercase flex-1"
              />
              <Button type="button" variant="outline" onClick={generateRandomCode}>
                Generate
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Discount Type</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.discountType === 'percentage' ? 'border-[#5B4BFF]' : 'border-gray-300'}`}>
                    {formData.discountType === 'percentage' && <div className="w-2.5 h-2.5 rounded-full bg-[#5B4BFF]" />}
                  </div>
                  <input
                    type="radio"
                    name="discountType"
                    value="percentage"
                    checked={formData.discountType === 'percentage'}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="hidden"
                  />
                  <span className="text-sm font-medium text-gray-700">Percentage (%)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.discountType === 'fixed' ? 'border-[#5B4BFF]' : 'border-gray-300'}`}>
                    {formData.discountType === 'fixed' && <div className="w-2.5 h-2.5 rounded-full bg-[#5B4BFF]" />}
                  </div>
                  <input
                    type="radio"
                    name="discountType"
                    value="fixed"
                    checked={formData.discountType === 'fixed'}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="hidden"
                  />
                  <span className="text-sm font-medium text-gray-700">Fixed (₹)</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value {formData.discountType === 'percentage' ? '(1-100)' : '(₹)'}
              </label>
              <Input
                required
                type="number"
                min="1"
                max={formData.discountType === 'percentage' ? "100" : undefined}
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                placeholder="e.g. 50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Redemptions</label>
            <Input
              required
              type="number"
              min="1"
              value={formData.maxUsage}
              onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
              placeholder="e.g. 1"
            />
            <p className="text-xs text-gray-500 mt-1">Number of times this coupon can be used globally.</p>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCoupons;
