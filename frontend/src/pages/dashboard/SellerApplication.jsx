import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { HiCheckCircle, HiClock, HiXCircle } from 'react-icons/hi';

const SellerApplication = () => {
  const [status, setStatus] = useState(null); // 'none', 'pending', 'approved', 'rejected'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    description: '',
    additionalInfo: ''
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await apiGet('/seller/application/me');
      if (res.data) {
        setStatus(res.data.status);
      } else {
        setStatus('none');
      }
    } catch (error) {
      toast.error('Failed to load application status');
      setStatus('none');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiPost('/seller/application', formData);
      toast.success('Application submitted successfully!');
      setStatus('pending');
    } catch (error) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-16 text-center text-[#94A3B8] font-medium animate-pulse">Loading application status...</div>;

  if (status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto mt-10 text-center bg-white p-12 rounded-[24px] border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-amber-400 rounded-full blur-[48px] opacity-20" />
        <div className="w-20 h-20 bg-amber-50 rounded-[20px] flex items-center justify-center mx-auto mb-6">
          <HiClock className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-[24px] font-extrabold text-[#0F172A] mb-3 tracking-[-0.02em]">Application Under Review</h2>
        <p className="text-[#64748B] text-[15px] max-w-md mx-auto leading-relaxed">Your seller application is currently being reviewed by our team. We will notify you once a decision has been made.</p>
      </div>
    );
  }

  if (status === 'approved') {
    return (
      <div className="max-w-2xl mx-auto mt-10 text-center bg-white p-12 rounded-[24px] border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-[#10B981] rounded-full blur-[48px] opacity-20" />
        <div className="w-20 h-20 bg-[#F0FDF4] rounded-[20px] flex items-center justify-center mx-auto mb-6">
          <HiCheckCircle className="w-10 h-10 text-[#10B981]" />
        </div>
        <h2 className="text-[24px] font-extrabold text-[#0F172A] mb-3 tracking-[-0.02em]">Application Approved!</h2>
        <p className="text-[#64748B] text-[15px] mb-8 max-w-md mx-auto leading-relaxed">Congratulations! You are now a seller on StreamKart.</p>
        <Button size="lg" className="px-8 shadow-[0_4px_14px_rgba(91,75,255,0.3)]" onClick={() => window.location.href = '/seller'}>Go to Seller Dashboard</Button>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto mt-10 text-center bg-white p-12 rounded-[24px] border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-[#EF4444] rounded-full blur-[48px] opacity-20" />
        <div className="w-20 h-20 bg-[#FEF2F2] rounded-[20px] flex items-center justify-center mx-auto mb-6">
          <HiXCircle className="w-10 h-10 text-[#EF4444]" />
        </div>
        <h2 className="text-[24px] font-extrabold text-[#0F172A] mb-3 tracking-[-0.02em]">Application Rejected</h2>
        <p className="text-[#64748B] text-[15px] mb-8 max-w-md mx-auto leading-relaxed">Unfortunately, your application to become a seller has been rejected at this time. You may try again later or contact support.</p>
        <Button size="lg" onClick={() => setStatus('none')} variant="secondary" className="px-8">Submit New Application</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4">
      <h1 className="text-[32px] font-extrabold text-[#0F172A] mb-3 tracking-[-0.02em]">Seller Application</h1>
      <p className="text-[#64748B] text-[16px] mb-10">Tell us about your business to start selling on StreamKart.</p>

      <form onSubmit={handleSubmit} className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required className="bg-[#F8FAFC] border-transparent focus:bg-white" />
          <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required className="bg-[#F8FAFC] border-transparent focus:bg-white" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required className="bg-[#F8FAFC] border-transparent focus:bg-white" />
        </div>
        
        <div>
          <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-[0.08em]">Business Description *</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            required
            rows={5}
            className="w-full px-5 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] focus:bg-white focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] transition-all outline-none text-[#0F172A] placeholder-[#94A3B8] resize-none"
            placeholder="Tell us what you sell and why you want to join StreamKart..."
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-[0.08em]">Additional Information (Optional)</label>
          <textarea 
            name="additionalInfo" 
            value={formData.additionalInfo} 
            onChange={handleChange}
            rows={3}
            className="w-full px-5 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] focus:bg-white focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] transition-all outline-none text-[#0F172A] placeholder-[#94A3B8] resize-none"
            placeholder="Links to your website, social media, or current store..."
          />
        </div>

        <div className="pt-6 border-t border-[#F1F5F9] mt-2">
          <Button type="submit" className="w-full shadow-[0_4px_14px_rgba(91,75,255,0.3)]" size="lg" loading={submitting}>Submit Application</Button>
        </div>
      </form>
    </div>
  );
};

export default SellerApplication;
