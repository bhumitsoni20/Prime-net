import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { HiPlus, HiPencil, HiTrash, HiExclamation } from 'react-icons/hi';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import api from '../../services/api';

const SellerBundles = () => {
  const queryClient = useQueryClient();
  const [bundleToDelete, setBundleToDelete] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['sellerBundles'],
    queryFn: async () => {
      const res = await api.get('/bundles/seller');
      return res;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/bundles/${id}`);
    },
    onSuccess: () => {
      toast.success('Bundle deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['sellerBundles'] });
      queryClient.invalidateQueries({ queryKey: ['publicBundles'] });
      queryClient.invalidateQueries({ queryKey: ['adminBundles'] });
      setBundleToDelete(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete bundle');
      setBundleToDelete(null);
    }
  });

  const confirmDelete = () => {
    if (!bundleToDelete) return;
    deleteMutation.mutate(bundleToDelete._id);
  };

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  const bundles = data?.data || [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em]">My Bundles</h1>
        <Link to="/seller/bundles/create">
          <Button size="lg" className="shadow-[0_4px_14px_rgba(91,75,255,0.3)]">
            <HiPlus className="w-[18px] h-[18px] mr-1.5" /> Create Bundle
          </Button>
        </Link>
      </div>

      {bundles.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-12 text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="w-20 h-20 bg-[#F8FAFC] border border-[#F1F5F9] rounded-[20px] flex items-center justify-center mx-auto mb-5 shadow-sm text-3xl">🎁</div>
          <h3 className="text-[20px] font-bold text-[#0F172A] mb-2">No Bundles Yet</h3>
          <p className="text-[#64748B] text-[15px] mb-6 max-w-sm mx-auto">Create money-saving bundles to increase your sales.</p>
          <Link to="/seller/bundles/create"><Button variant="outline">Create First Bundle</Button></Link>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">
                <th className="p-5 pl-6">Bundle</th>
                <th className="p-5">Price</th>
                <th className="p-5">Products Included</th>
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
                  <td className="p-5 text-sm font-bold text-[#0F172A]">₹{bundle.bundlePrice}</td>
                  <td className="p-5 text-sm font-medium text-[#64748B]">{bundle.products?.length || 0} Products</td>
                  <td className="p-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                      bundle.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 
                      bundle.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100/50' : 
                      bundle.status === 'inactive' ? 'bg-amber-50 text-amber-600 border border-amber-100/50' :
                      bundle.status === 'sold' ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                      'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                      {bundle.status}
                    </span>
                  </td>
                  <td className="p-5 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/seller/bundles/${bundle._id}/edit`} className="inline-flex p-2.5 text-[#64748B] hover:text-[#5B4BFF] hover:bg-[#EEF2FF] rounded-[10px] transition-colors">
                        <HiPencil className="w-[18px] h-[18px]" />
                      </Link>
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
            Are you sure you want to delete <span className="font-bold text-[#0F172A]">{bundleToDelete?.title}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1 shadow-sm" onClick={() => setBundleToDelete(null)}>Cancel</Button>
            <Button className="flex-1 bg-red-500 hover:bg-red-600 shadow-[0_4px_14px_rgba(239,68,68,0.3)]" onClick={confirmDelete} disabled={deleteMutation.isLoading}>
              {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SellerBundles;
