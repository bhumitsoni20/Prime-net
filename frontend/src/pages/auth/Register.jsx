import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiUser, HiMail, HiLockClosed } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { signUpWithEmail, signInWithGoogle } from '../../firebase/auth';
import { registerUser } from '../../services/auth.service';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect') || '/';

  const handleRegister = async (e) => {
    e.preventDefault();
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~-]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      toast.error('Password must be at least 8 characters long and contain an uppercase letter, a number, and a special character.');
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
      await registerUser({ name, email });
      toast.success('Account created!');
      navigate('/verify-email');
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please log in instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email sign-in is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.';
      } else if (error.message) {
        errorMessage = error.message.replace('Firebase: ', '');
      }
      toast.error(errorMessage);
    } finally { 
      setLoading(false); 
    }
  };

  const handleGoogleLogin = async () => {
    try { await signInWithGoogle(); toast.success('Welcome!'); navigate(redirectUrl); }
    catch (error) { toast.error(error.message || 'Google login failed'); }
  };

  return (
    <div>
      <h1 className="text-[28px] font-extrabold text-[#0F172A] mb-2 tracking-[-0.02em]">Create account ✨</h1>
      <p className="text-[#64748B] text-[15px] mb-6">Start your journey with StreamKart.</p>
      
      <form onSubmit={handleRegister} className="space-y-4">
        <Input label="Full Name" icon={HiUser} placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Email" type="email" icon={HiMail} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" icon={HiLockClosed} placeholder="Min. 8 chars, 1 uppercase, 1 number, 1 symbol" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
          Create Account <span className="ml-1.5 transition-transform group-hover:translate-x-1">→</span>
        </Button>
      </form>
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E2E8F0]" /></div>
        <div className="relative flex justify-center"><span className="bg-white px-4 text-[13px] text-[#94A3B8] font-medium uppercase tracking-wider">or</span></div>
      </div>
      
      <Button variant="secondary" onClick={handleGoogleLogin} className="w-full" size="lg">
        <FcGoogle className="w-5 h-5" /> Sign up with Google
      </Button>
      
      <p className="text-center text-[13px] text-[#64748B] mt-6 leading-relaxed">
        By continuing, you agree to our <Link to="/terms" className="text-[#5B4BFF] hover:underline font-medium">Terms of Service</Link> and <Link to="/privacy" className="text-[#5B4BFF] hover:underline font-medium">Privacy Policy</Link>.
      </p>
    </div>
  );
};

export default Register;
