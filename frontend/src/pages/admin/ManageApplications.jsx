import { useState, useEffect, useMemo } from 'react';
import { apiGet, apiPut } from '../../services/api';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import { 
  HiCheck, 
  HiX, 
  HiSearch, 
  HiOutlineUserGroup, 
  HiOutlineClock, 
  HiOutlineCheckCircle, 
  HiOutlineXCircle,
  HiOutlineDocumentText,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineExternalLink
} from 'react-icons/hi';

const ManageApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeDetailApp, setActiveDetailApp] = useState(null);
  const [processingId, setProcessingId] = useState(null);

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
      setProcessingId(id);
      await apiPut(`/admin/applications/${id}/status`, { status: newStatus });
      toast.success(`Application ${newStatus}!`);
      if (activeDetailApp?._id === id) {
        setActiveDetailApp(null);
      }
      fetchApplications();
    } catch (error) {
      toast.error(error.message || 'Failed to update application');
    } finally {
      setProcessingId(null);
    }
  };

  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(a => a.status === 'pending').length;
    const approved = applications.filter(a => a.status === 'approved').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [applications]);

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        app.fullName?.toLowerCase().includes(q) ||
        app.email?.toLowerCase().includes(q) ||
        app.phone?.toLowerCase().includes(q) ||
        app.description?.toLowerCase().includes(q);
      
      const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[26px] font-extrabold text-[#0F172A] tracking-[-0.02em]">Seller KYC Applications</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF2FF] text-[#5B4BFF] border border-[#E0E7FF]">
              {applications.length} Submissions
            </span>
          </div>
          <p className="text-[#64748B] text-[14px]">Review merchant credentials, portfolio proofs, and onboard verified sellers.</p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Total Submissions</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#EEF2FF] text-[#5B4BFF] flex items-center justify-center">
              <HiOutlineUserGroup className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#0F172A]">{stats.total}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">All applicant records</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Pending KYC</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center">
              <HiOutlineClock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#F59E0B]">{stats.pending}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Action required</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Approved Sellers</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <HiOutlineCheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#10B981]">{stats.approved}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Active verified merchants</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Rejected</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center">
              <HiOutlineXCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#EF4444]">{stats.rejected}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Declined applications</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F8FAFC] border border-[#F1F5F9] rounded-[16px] overflow-x-auto">
            {[
              { id: 'all', label: 'All Applications', count: stats.total },
              { id: 'pending', label: 'Pending', count: stats.pending },
              { id: 'approved', label: 'Approved', count: stats.approved },
              { id: 'rejected', label: 'Rejected', count: stats.rejected }
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
              placeholder="Search applicant name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-[14px] py-2.5 pl-10 pr-4 text-[13px] font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#5B4BFF] focus:ring-4 focus:ring-[#5B4BFF]/10 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">
                <th className="p-4 pl-6">Applicant Info</th>
                <th className="p-4">Business Experience & Pitch</th>
                <th className="p-4">KYC Status</th>
                <th className="p-4 pr-6 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-16 text-center text-[#94A3B8] font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-[#5B4BFF] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-semibold">Loading applications...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-16 h-16 rounded-[20px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-2xl mb-4 shadow-sm">
                        📋
                      </div>
                      <h3 className="text-[17px] font-bold text-[#0F172A] mb-1">No applications found</h3>
                      <p className="text-[13px] text-[#64748B] mb-4">No seller applications match your current filters.</p>
                      {(searchQuery || selectedStatus !== 'all') && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedStatus('all');
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-[#F8FAFC] transition-colors group">
                    {/* Applicant Profile */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] border border-[#C7D2FE] text-[#5B4BFF] flex items-center justify-center font-extrabold text-sm shadow-sm flex-shrink-0">
                          {app.fullName?.charAt(0) || 'A'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#0F172A] font-bold text-[14px] group-hover:text-[#5B4BFF] transition-colors mb-0.5">
                            {app.fullName}
                          </p>
                          <p className="text-[#64748B] text-[12px] flex items-center gap-1">
                            <HiOutlineMail className="w-3.5 h-3.5 text-[#94A3B8]" />
                            {app.email}
                          </p>
                          {app.phone && (
                            <p className="text-[#94A3B8] text-[11px] font-mono flex items-center gap-1 mt-0.5">
                              <HiOutlinePhone className="w-3.5 h-3.5" />
                              {app.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Pitch Description */}
                    <td className="p-4 max-w-sm">
                      <p className="text-[#334155] text-[13px] line-clamp-2 leading-relaxed font-normal">
                        {app.description || 'No description provided.'}
                      </p>
                      {app.additionalInfo && (
                        <a
                          href={app.additionalInfo.startsWith('http') ? app.additionalInfo : `https://${app.additionalInfo}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#5B4BFF] text-[11px] font-bold hover:underline mt-1 bg-[#EEF2FF] px-2 py-0.5 rounded-[6px]"
                        >
                          <HiOutlineExternalLink className="w-3 h-3" /> Proof / Store Link
                        </a>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border ${
                        app.status === 'approved'
                          ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                          : app.status === 'rejected'
                          ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]'
                          : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          app.status === 'approved' ? 'bg-[#10B981]' : app.status === 'rejected' ? 'bg-[#EF4444]' : 'bg-[#F59E0B]'
                        }`}></span>
                        {app.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveDetailApp(app)}
                          className="p-2 text-[#64748B] hover:text-[#5B4BFF] hover:bg-[#EEF2FF] rounded-[10px] transition-colors"
                          title="View Full Application"
                        >
                          <HiOutlineDocumentText className="w-5 h-5" />
                        </button>

                        {app.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusChange(app._id, 'approved')} 
                              isLoading={processingId === app._id}
                              className="!bg-[#10B981] hover:!bg-[#059669] text-white shadow-sm font-bold text-[12px] px-3 py-1.5 rounded-[10px]"
                            >
                              <HiCheck className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => handleStatusChange(app._id, 'rejected')} 
                              isLoading={processingId === app._id}
                              className="!text-[#EF4444] hover:!bg-[#FEF2F2] border-[#FECACA] font-bold text-[12px] px-3 py-1.5 rounded-[10px]"
                            >
                              <HiX className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        {app.status !== 'pending' && (
                          <span className="text-[#94A3B8] text-[12px] font-semibold bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-[8px]">
                            Reviewed
                          </span>
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

      {/* Application Details Modal */}
      <Modal isOpen={!!activeDetailApp} onClose={() => setActiveDetailApp(null)} title="Seller Application Details">
        {activeDetailApp && (
          <div className="space-y-5 p-1">
            {/* Applicant Profile Header */}
            <div className="flex items-center gap-3.5 p-4 rounded-[16px] bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] border border-[#C7D2FE] text-[#5B4BFF] flex items-center justify-center font-extrabold text-lg shadow-sm flex-shrink-0">
                {activeDetailApp.fullName?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-[16px] font-bold text-[#0F172A]">{activeDetailApp.fullName}</h4>
                  <Badge variant={activeDetailApp.status === 'approved' ? 'success' : activeDetailApp.status === 'rejected' ? 'danger' : 'warning'}>
                    {activeDetailApp.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#64748B] mt-1">
                  <span>✉️ {activeDetailApp.email}</span>
                  {activeDetailApp.phone && <span>📞 {activeDetailApp.phone}</span>}
                </div>
              </div>
            </div>

            {/* Description / Experience */}
            <div>
              <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                Merchant Background & Sourcing Pitch
              </label>
              <div className="p-4 rounded-[16px] bg-white border border-[#E2E8F0] text-[14px] text-[#334155] leading-relaxed whitespace-pre-line shadow-sm">
                {activeDetailApp.description || 'No detailed background provided.'}
              </div>
            </div>

            {/* Links / Portfolio */}
            {activeDetailApp.additionalInfo && (
              <div>
                <label className="block text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                  Proof / Store Reference
                </label>
                <div className="p-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-[13px] font-medium text-[#475569] truncate max-w-xs">{activeDetailApp.additionalInfo}</span>
                  <a
                    href={activeDetailApp.additionalInfo.startsWith('http') ? activeDetailApp.additionalInfo : `https://${activeDetailApp.additionalInfo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] font-bold text-[#5B4BFF] hover:underline flex items-center gap-1 flex-shrink-0"
                  >
                    Open Link <HiOutlineExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
              <Button variant="secondary" onClick={() => setActiveDetailApp(null)}>
                Close
              </Button>
              {activeDetailApp.status === 'pending' && (
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => handleStatusChange(activeDetailApp._id, 'rejected')} 
                    isLoading={processingId === activeDetailApp._id}
                    className="!text-[#EF4444] border-[#FECACA]"
                  >
                    Reject Application
                  </Button>
                  <Button 
                    onClick={() => handleStatusChange(activeDetailApp._id, 'approved')} 
                    isLoading={processingId === activeDetailApp._id}
                    className="!bg-[#10B981] hover:!bg-[#059669] text-white"
                  >
                    Approve Merchant
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageApplications;
