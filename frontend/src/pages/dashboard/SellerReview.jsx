import { Navigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { HiOutlineClock, HiOutlineExclamationCircle } from 'react-icons/hi';

const SellerReview = () => {
  const { user } = useAuthStore();

  if (user?.sellerStatus === 'none') {
    return <Navigate to="/dashboard/apply-seller" replace />;
  }

  if (user?.sellerStatus === 'approved') {
    return <Navigate to="/seller" replace />;
  }

  const isRejected = user?.sellerStatus === 'rejected';

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden relative">
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${isRejected ? 'bg-gradient-to-r from-[#EF4444] to-[#F87171]' : 'bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED]'}`} />
        
        <div className="p-10 md:p-14 text-center">
          <div className="relative mb-6">
            <div className={`absolute inset-0 rounded-full blur-[32px] opacity-20 ${isRejected ? 'bg-[#EF4444]' : 'bg-[#5B4BFF]'}`} />
            <div className={`relative mx-auto w-20 h-20 rounded-[20px] flex items-center justify-center ${isRejected ? 'bg-[#FEF2F2] text-[#EF4444]' : 'bg-gradient-to-br from-[#5B4BFF]/10 to-[#7C3AED]/10 text-[#5B4BFF]'} shadow-sm border ${isRejected ? 'border-[#FECACA]' : 'border-[#5B4BFF]/20'}`}>
              {isRejected ? <HiOutlineExclamationCircle className="w-10 h-10" /> : <HiOutlineClock className="w-10 h-10" />}
            </div>
          </div>
          
          <h1 className="text-[28px] font-extrabold text-[#0F172A] mb-4 tracking-[-0.02em]">
            {isRejected ? 'Application Not Approved' : 'Application Under Review'}
          </h1>
          
          <p className="text-[#64748B] text-[16px] mb-10 max-w-lg mx-auto leading-relaxed">
            {isRejected 
              ? 'Your seller application was not approved. Please contact support for more information on our seller policies or to appeal this decision.'
              : 'Thank you for applying to become a seller on StreamKart. Your application is currently under review. Verification may take up to 24 hours. Once approved, you will gain access to the Seller Dashboard and can start selling products.'
            }
          </p>

          <div className="bg-[#F8FAFC] rounded-[20px] p-8 max-w-md mx-auto mb-10 border border-[#F1F5F9] text-left shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
            <div className="space-y-5">
              <div className="flex justify-between items-center pb-5 border-b border-[#E2E8F0]">
                <span className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">Current Status</span>
                <Badge variant={isRejected ? 'danger' : 'warning'}>
                  {isRejected ? 'Rejected' : 'Pending Review'}
                </Badge>
              </div>
              <div className="flex justify-between items-center pb-5 border-b border-[#E2E8F0]">
                <span className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">Submitted</span>
                <span className="text-[15px] text-[#0F172A] font-bold">
                  {user?.applicationSubmittedAt ? new Date(user.applicationSubmittedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              {!isRejected && (
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">Estimated Time</span>
                  <span className="text-[15px] text-[#0F172A] font-bold">Up to 24 hours</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="flex-1 max-w-[220px]">
              <Button size="lg" className="w-full shadow-[0_4px_14px_rgba(91,75,255,0.3)]">Go to Marketplace</Button>
            </Link>
            <Link to="/dashboard" className="flex-1 max-w-[220px]">
              <Button size="lg" variant="secondary" className="w-full border-[#E2E8F0]">Return to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerReview;
