import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { HiCheckCircle, HiXCircle, HiTrash, HiExclamation } from 'react-icons/hi';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminBundles = () => {
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
      queryClient.invalidateQueries(['adminBundles']);
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

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  const bundles = data?.data || [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em]">Manage Bundles</h1>
      </div>

      {bundles.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-12 text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="w-20 h-20 bg-[#F8FAFC] border border-[#F1F5F9] rounded-[20px] flex items-center justify-center mx-auto mb-5 shadow-sm text-3xl">🎁</div>
          <h3 className="text-[20px] font-bold text-[#0F172A] mb-2">No Bundles Found</h3>
          <p className="text-[#64748B] text-[15px] mb-6 max-w-sm mx-auto">No bundles have been created by sellers yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">
                <th className="p-5 pl-6">Bundle</th>
                <th className="p-5">Seller</th>
                <th className="p-5">Price</th>
                <th className="p-5">Status</th>
                <th className="p-5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {bundles.map(bundle => (
                <tr key={bundle._id} className="hover:bg-[#F8FAFC] transition-colors group">
                  <td className="p-5 pl-6 text-sm font-medium text-[#0F172A]">
                    <div className="flex items-center gap-4">
                      {bundle.thumbnail ? (
                        <img src={bundle.thumbnail} alt={bundle.title} className="w-[42px] h-[42px] rounded-[10px] object-cover border border-[#E2E8F0] shadow-sm bg-white" />
                      ) : (
                        <div className="w-[42px] h-[42px] rounded-[10px] bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-lg shadow-sm">🎁</div>
                      )}
                      <div>
                        <div className="font-bold text-[#0F172A] text-[15px] mb-0.5 group-hover:text-[#5B4BFF] transition-colors">{bundle.title}</div>
                        <div className="text-[12.5px] font-semibold text-[#64748B]">{bundle.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <img src={bundle.seller?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(bundle.seller?.name || 'Seller')} alt={bundle.seller?.name} className="w-8 h-8 rounded-full bg-[#E2E8F0]" />
                      <div>
                        <div className="font-semibold text-[#0F172A] text-[14px]">{bundle.seller?.name}</div>
                        <div className="text-[12px] text-[#64748B]">{bundle.seller?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-sm font-bold text-[#0F172A]">₹{bundle.bundlePrice}</td>
                  <td className="p-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                      bundle.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 
                      bundle.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100/50' : 
                      'bg-slate-50 text-slate-500 border border-slate-200'
                    }`}>
                      {bundle.status}
                    </span>
                  </td>
                  <td className="p-5 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {bundle.status !== 'active' && (
                        <button onClick={() => updateStatusMutation.mutate({ id: bundle._id, status: 'active' })} className="p-2.5 text-[#64748B] hover:text-[#10B981] hover:bg-[#ECFDF5] rounded-[10px] transition-colors">
                          <HiCheckCircle className="w-[18px] h-[18px]" />
                        </button>
                      )}
                      {bundle.status === 'active' && (
                        <button onClick={() => updateStatusMutation.mutate({ id: bundle._id, status: 'inactive' })} className="p-2.5 text-[#64748B] hover:text-[#F59E0B] hover:bg-[#FFFBEB] rounded-[10px] transition-colors">
                          <HiXCircle className="w-[18px] h-[18px]" />
                        </button>
                      )}
                      <button onClick={() => setBundleToDelete(bundle)} className="p-2.5 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-[10px] transition-colors">
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

      {/* Delete Modal */}
      <Modal isOpen={!!bundleToDelete} onClose={() => setBundleToDelete(null)} title="Delete Bundle">
        <div className="flex flex-col items-center text-center p-2">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6 border-4 border-red-50/50">
            <HiExclamation className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-[#0F172A] mb-2">Delete this bundle?</h3>
          <p className="text-[#64748B] text-[15px] mb-8 max-w-[280px]">
            Are you sure you want to delete <span className="font-bold text-[#0F172A]">{bundleToDelete?.title}</span>?
          </p>
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1 shadow-sm" onClick={() => setBundleToDelete(null)}>Cancel</Button>
            <Button className="flex-1 bg-red-500 hover:bg-red-600 shadow-[0_4px_14px_rgba(239,68,68,0.3)]" onClick={() => deleteMutation.mutate(bundleToDelete._id)} disabled={deleteMutation.isLoading}>
              {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminBundles;
