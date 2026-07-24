import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiMail } from 'react-icons/hi';
import { requestPasswordReset } from '../../services/auth.service';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Email is required'); return; }
    setLoading(true);
    try { 
      await requestPasswordReset(email); 
      setSent(true); 
      toast.success('Reset link sent!'); 
    }
    catch (error) { toast.error(error.message || 'Failed to send reset email'); }
    finally { setLoading(false); }
  };

  if (sent) {
    return (
      <div className="text-center animate-scaleIn">
        <div className="h-16 w-16 rounded-[16px] bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center mx-auto mb-6 shadow-[0_4px_12px_rgba(91,75,255,0.1)]">
          <span className="text-3xl">✉️</span>
        </div>
        <h1 className="text-[28px] font-extrabold text-[#0F172A] mb-2 tracking-[-0.02em]">Check your email</h1>
        <p className="text-[#64748B] text-[15px] mb-8 leading-relaxed">
          We sent a password reset link to<br/>
          <span className="text-[#0F172A] font-semibold">{email}</span>
        </p>
        <Link to="/login"><Button variant="secondary" className="w-full">Back to Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-[28px] font-extrabold text-[#0F172A] mb-2 tracking-[-0.02em]">Reset Password 🔐</h1>
      <p className="text-[#64748B] text-[15px] mb-8">Enter your email to receive a reset link.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" type="email" icon={HiMail} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
          Send Reset Link <span className="ml-1.5 transition-transform group-hover:translate-x-1">→</span>
        </Button>
      </form>
      
      <p className="text-center text-[14px] text-[#64748B] mt-8">
        <Link to="/login" className="text-[#5B4BFF] font-semibold hover:underline">← Back to Sign In</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
