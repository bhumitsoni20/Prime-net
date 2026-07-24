import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMail, HiRefresh } from 'react-icons/hi';
import { auth } from '../../firebase/config';
import { sendVerificationEmail } from '../../services/auth.service';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = auth?.currentUser;

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    
    // Poll to check if email is verified
    const interval = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          clearInterval(interval);
          toast.success('Email verified successfully!');
          navigate('/');
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user, navigate]);

  const handleResend = async () => {
    setLoading(true);
    try {
      await sendVerificationEmail();
      toast.success('Verification email sent!');
    } catch (error) {
      toast.error(error.message || 'Failed to send verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center animate-scaleIn">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[#5B4BFF]/20 rounded-[16px] blur-[12px] animate-pulse" />
        <div className="relative w-16 h-16 bg-gradient-to-br from-[#5B4BFF] to-[#7C3AED] rounded-[16px] flex items-center justify-center shadow-[0_8px_24px_rgba(91,75,255,0.35)]">
          <HiMail className="w-8 h-8 text-white" />
        </div>
      </div>
      
      <h1 className="text-[28px] font-extrabold text-[#0F172A] mb-2 tracking-[-0.02em]">Check your inbox</h1>
      <p className="text-[#64748B] text-[15px] mb-8 max-w-sm mx-auto leading-relaxed">
        We've sent a verification link to <span className="font-semibold text-[#0F172A]">{user?.email}</span>. 
        Please click the link to verify your account.
      </p>

      <div className="space-y-4 w-full max-w-sm">
        <Button onClick={handleResend} className="w-full" size="lg" loading={loading}>
          <HiRefresh className={`w-[18px] h-[18px] mr-2 ${loading ? 'animate-spin' : ''}`} /> Resend verification
        </Button>
        <Link to="/" className="block">
          <Button variant="secondary" className="w-full" size="lg">
            Back to Home
          </Button>
        </Link>
      </div>

      <p className="text-[13px] text-[#94A3B8] mt-8 max-w-xs mx-auto">
        Didn't receive the email? Check your spam folder or try resending.
      </p>
    </div>
  );
};

export default VerifyEmail;
