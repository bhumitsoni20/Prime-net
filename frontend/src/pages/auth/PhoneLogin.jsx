import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiPhone } from 'react-icons/hi';
import { setupRecaptcha, sendOTP, verifyOTP } from '../../firebase/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const PhoneLogin = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const confirmationRef = useRef(null);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) { toast.error('Enter a valid phone number'); return; }
    setLoading(true);
    try {
      const recaptcha = setupRecaptcha('recaptcha-container');
      const phoneNumber = phone.startsWith('+') ? phone : `+91${phone}`;
      const result = await sendOTP(phoneNumber, recaptcha);
      confirmationRef.current = result;
      setStep('otp');
      toast.success('OTP sent!');
    } catch (error) { toast.error(error.message || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { toast.error('Enter a valid 6-digit OTP'); return; }
    setLoading(true);
    try {
      await verifyOTP(confirmationRef.current, otp);
      toast.success('Phone verified!');
      navigate('/dashboard');
    } catch (error) { toast.error(error.message || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="text-[28px] font-extrabold text-[#0F172A] mb-2 tracking-[-0.02em]">Phone Login 📱</h1>
      <p className="text-[#64748B] text-[15px] mb-8">Sign in with your phone number.</p>
      
      {step === 'phone' ? (
        <form onSubmit={handleSendOTP} className="space-y-4 animate-fadeIn">
          <Input label="Phone Number" icon={HiPhone} placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <div id="recaptcha-container" />
          <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
            Send OTP <span className="ml-1.5 transition-transform group-hover:translate-x-1">→</span>
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4 animate-scaleIn">
          <Input label="Enter OTP" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required />
          <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
            Verify & Sign In <span className="ml-1.5 transition-transform group-hover:translate-x-1">→</span>
          </Button>
          <button type="button" onClick={() => setStep('phone')} className="text-[13px] text-[#5B4BFF] hover:text-[#4338CA] w-full text-center font-semibold transition-colors mt-2">
            Change phone number
          </button>
        </form>
      )}
      
      <p className="text-center text-[14px] text-[#64748B] mt-8">
        <Link to="/login" className="text-[#5B4BFF] font-semibold hover:underline">← Back to Sign In</Link>
      </p>
    </div>
  );
};

export default PhoneLogin;
