import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiMail, HiLockClosed } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { signInWithEmail, signInWithGoogle } from '../../firebase/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect') || '/';

  const handleEmailLogin = async (e) => {
    e.preventDefault();
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
        toast.success('Welcome!');
        navigate(redirectUrl);
      }
    } catch (error) {
      toast.error(error.message || 'Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-[28px] font-extrabold text-[#0F172A] mb-2 tracking-[-0.02em]">Welcome back 👋</h1>
      <p className="text-[#64748B] text-[15px] mb-8">Login to access your StreamKart account</p>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <Input
          label="Email"
          type="email"
          icon={HiMail}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div>
          <Input
            label="Password"
            type="password"
            icon={HiLockClosed}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end mt-2">
            <Link
              to="/forgot-password"
              className="text-[13px] text-[#5B4BFF] hover:text-[#4338CA] font-semibold transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
          Log in <span className="ml-1.5 transition-transform group-hover:translate-x-1">→</span>
        </Button>
      </form>

      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E2E8F0]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-[13px] text-[#94A3B8] font-medium uppercase tracking-wider">or</span>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="secondary"
          onClick={handleGoogleLogin}
          className="w-full"
          size="lg"
          loading={googleLoading}
        >
          <FcGoogle className="w-5 h-5" /> Continue with Google
        </Button>
      </div>

      <p className="text-center text-[13px] text-[#64748B] mt-8 leading-relaxed">
        By continuing, you agree to our{' '}
        <Link to="/terms" className="text-[#5B4BFF] hover:underline font-medium">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy" className="text-[#5B4BFF] hover:underline font-medium">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
};

export default Login;
