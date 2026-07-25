import { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../../services/api';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { HiCheck, HiX } from 'react-icons/hi';

const ManageApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await apiGet('/admin/applications');
      setApplications(res.data || []);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await apiPut(`/admin/applications/${id}/status`, { status: newStatus });
      toast.success(`Application ${newStatus}!`);
      fetchApplications();
    } catch (error) {
      toast.error(error.message || 'Failed to update application');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em] mb-1">Seller Applications</h1>
          <p className="text-[#64748B] text-[15px]">Review and approve requests to become a seller.</p>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">
                <th className="p-5 pl-6">Applicant</th>
                <th className="p-5">Description</th>
                <th className="p-5">Status</th>
                <th className="p-5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-[#94A3B8] font-medium animate-pulse">Loading applications...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-[#64748B] font-medium bg-[#F8FAFC]">No applications found.</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app._id} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="p-5 pl-6">
                      <p className="text-[#0F172A] font-bold text-[15px] group-hover:text-[#5B4BFF] transition-colors mb-0.5">{app.fullName}</p>
                      <p className="text-[#64748B] text-[13px]">{app.email}</p>
                      <p className="text-[#94A3B8] text-[12px] font-mono mt-0.5">{app.phone}</p>
                    </td>
                    <td className="p-5 max-w-xs">
                      <p className="text-[#334155] text-[14px] line-clamp-2 leading-relaxed" title={app.description}>{app.description}</p>
                      {app.additionalInfo && (
                        <p className="text-[#94A3B8] text-[12px] truncate mt-1.5" title={app.additionalInfo}>🔗 {app.additionalInfo}</p>
                      )}
                    </td>
                    <td className="p-5">
                      <Badge variant={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}>
                        {app.status}
                      </Badge>
                    </td>
                    <td className="p-5 pr-6">
                      <div className="flex items-center justify-end gap-2.5">
                        {app.status === 'pending' && (
                          <>
                            <Button size="sm" variant="secondary" onClick={() => handleStatusChange(app._id, 'approved')} className="!text-[#16A34A] !bg-[#F0FDF4] hover:!bg-[#DCFCE7] border-[#BBF7D0] shadow-sm font-semibold px-4">
                              <HiCheck className="w-[18px] h-[18px] mr-1.5" /> Approve
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleStatusChange(app._id, 'rejected')} className="!text-[#EF4444] !bg-[#FEF2F2] hover:!bg-[#FEE2E2] border-[#FECACA] shadow-sm font-semibold px-4">
                              <HiX className="w-[18px] h-[18px] mr-1.5" /> Reject
                            </Button>
                          </>
                        )}
                        {app.status !== 'pending' && (
                           <span className="text-[#94A3B8] text-[13px] font-medium bg-[#F1F5F9] px-3 py-1 rounded-[8px]">Reviewed</span>
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
    </div>
  );
};

export default ManageApplications;
