import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUserRole, deleteUser } from '../../services/admin.service';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { HiTrash, HiExclamation } from 'react-icons/hi';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const ManageUsers = () => {
  const queryClient = useQueryClient();
  const [userToDelete, setUserToDelete] = useState(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await getUsers(1, 100);
      return response.data || [];
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, newRole }) => updateUserRole(userId, newRole),
    onSuccess: () => {
      toast.success('User role updated');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: () => toast.error('Failed to update role'),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId) => deleteUser(userId),
    onMutate: async (deletedUserId) => {
      await queryClient.cancelQueries({ queryKey: ['adminUsers'] });
      const previousUsers = queryClient.getQueryData(['adminUsers']);
      
      // Optimistically update the UI to instantly hide the deleted user
      queryClient.setQueryData(['adminUsers'], (old) => old?.filter(u => u._id !== deletedUserId));
      setUserToDelete(null);
      
      return { previousUsers };
    },
    onError: (err, deletedUserId, context) => {
      queryClient.setQueryData(['adminUsers'], context.previousUsers);
      toast.error(err.message || 'Failed to delete user');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onSuccess: () => toast.success('User deleted successfully'),
  });

  const handleRoleChange = (userId, newRole) => {
    roleMutation.mutate({ userId, newRole });
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    deleteMutation.mutate(userToDelete._id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em] mb-1">Manage Users</h1>
          <p className="text-[#64748B] text-[15px]">View and manage all registered users.</p>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-left text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] bg-[#F8FAFC]">
                <th className="p-5 pl-6">Name</th>
                <th className="p-5">Email</th>
                <th className="p-5">Role</th>
                <th className="p-5">Joined</th>
                <th className="p-5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr><td colSpan={5} className="p-12 text-center text-[#94A3B8] font-medium animate-pulse">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-[#64748B] font-medium bg-[#F8FAFC]">No users found.</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="p-5 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#5B4BFF]/10 to-[#7C3AED]/10 border border-[#5B4BFF]/20 text-[#5B4BFF] flex items-center justify-center font-extrabold text-lg shadow-sm flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="font-bold text-[15px] text-[#0F172A] group-hover:text-[#5B4BFF] transition-colors">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-5 text-[14px] font-medium text-[#475569]">{user.email}</td>
                    <td className="p-5">
                      <Badge variant={user.role === 'admin' ? 'purple' : user.role === 'seller' ? 'success' : 'gray'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-5 text-[13px] font-medium text-[#64748B]">{dayjs(user.createdAt).format('MMM DD, YYYY')}</td>
                    <td className="p-5 pr-6">
                      <div className="flex items-center justify-end gap-3">
                        <div className="relative w-[110px]">
                          <select
                            className="w-full appearance-none bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] px-3 py-2 pr-8 text-[12px] font-bold text-[#334155] focus:outline-none focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] focus:bg-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            disabled={roleMutation.isPending}
                          >
                            <option value="user">User</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#94A3B8]">
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                          </div>
                        </div>
                        {user.role !== 'admin' && (
                          <button 
                            onClick={() => setUserToDelete(user)}
                            className="p-2.5 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-[10px] transition-colors disabled:opacity-50"
                            title="Delete User"
                            disabled={deleteMutation.isPending}
                          >
                            <HiTrash className="w-[18px] h-[18px]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} title="Delete User">
        <div className="flex flex-col items-center text-center p-2">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#EF4444] rounded-full blur-[24px] opacity-20"></div>
            <div className="w-16 h-16 rounded-[20px] bg-[#FEF2F2] flex items-center justify-center relative border border-[#FECACA]">
              <HiExclamation className="w-8 h-8 text-[#EF4444]" />
            </div>
          </div>
          <h3 className="text-[20px] font-extrabold text-[#0F172A] mb-3">Delete {userToDelete?.name}?</h3>
          <p className="text-[#64748B] text-[15px] mb-8 leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-[#0F172A]">{userToDelete?.email}</strong>? This action cannot be undone and will erase all their data.
          </p>
          <div className="flex gap-4 w-full">
            <Button variant="secondary" size="lg" className="flex-1 border-[#E2E8F0]" onClick={() => setUserToDelete(null)}>Cancel</Button>
            <Button 
              size="lg"
              className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] focus:ring-[#EF4444]/20 border-transparent text-white shadow-[0_4px_14px_rgba(239,68,68,0.3)]" 
              onClick={confirmDelete}
              isLoading={deleteMutation.isPending}
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageUsers;
