import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiArrowRight } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { signInWithEmail, signInWithGoogle } from '../../firebase/auth';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect') || '/';

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      const user = await signInWithEmail(email, password);
      if (!user.emailVerified) {
        toast.error('Please verify your email to log in.');
        navigate('/verify-email');
        return;
      }
      toast.success('Welcome back!');
      navigate(redirectUrl);
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        toast.success('Welcome back!');
        navigate(redirectUrl);
      }
    } catch (error) {
      toast.error(error.message || 'Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-[22px] sm:text-[24px] font-black text-[#0F172A] tracking-[-0.03em] mb-1">
          Welcome back 👋
        </h1>
        <p className="text-slate-500 text-xs sm:text-[13px] font-medium">
          Sign in to access your digital passes, orders, and wallet.
        </p>
      </div>

      {/* Google 1-Tap Login Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 sm:py-2.5 px-4 rounded-[14px] bg-white border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all font-bold text-slate-700 text-xs sm:text-[13px] cursor-pointer disabled:opacity-60 group"
      >
        <FcGoogle className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105" />
        <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
      </button>

      {/* Divider */}
      <div className="relative my-3.5 sm:my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-2.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            or with email
          </span>
        </div>
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleEmailLogin} className="space-y-3 sm:space-y-3.5">
        
        {/* Email Input */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <div className="relative group">
            <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#5B4BFF] transition-colors" />
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-[12px] bg-[#F8FAFC] border border-slate-200 focus:bg-white focus:ring-[3px] focus:ring-[#5B4BFF]/15 focus:border-[#5B4BFF] transition-all outline-none text-slate-900 text-xs sm:text-[13px] font-medium"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[11px] text-[#5B4BFF] hover:underline font-bold"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
            <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#5B4BFF] transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-[12px] bg-[#F8FAFC] border border-slate-200 focus:bg-white focus:ring-[3px] focus:ring-[#5B4BFF]/15 focus:border-[#5B4BFF] transition-all outline-none text-slate-900 text-xs sm:text-[13px] font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-1">
          <Button 
            type="submit" 
            size="md" 
            className="w-full py-2.5 sm:py-3 text-xs sm:text-[13px] font-extrabold rounded-[14px] bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED] hover:from-[#4F3FE8] hover:to-[#6D28D9] text-white shadow-[0_4px_16px_rgba(91,75,255,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]" 
            isLoading={loading}
          >
            <span>Sign In to StreamKart</span>
            <HiArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </form>

      {/* Terms Notice */}
      <p className="text-center text-[11px] text-slate-400 mt-3 leading-relaxed">
        By continuing, you agree to StreamKart's{' '}
        <Link to="/terms" className="text-[#5B4BFF] hover:underline font-bold">
          Terms
        </Link>{' '}
        and{' '}
        <Link to="/privacy" className="text-[#5B4BFF] hover:underline font-bold">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
};

export default Login;
