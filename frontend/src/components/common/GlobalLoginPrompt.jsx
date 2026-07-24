import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Modal from '../ui/Modal';
import Login from '../../pages/auth/Login';
import Register from '../../pages/auth/Register';

const GlobalLoginPrompt = () => {
  const { isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('login');
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated || location.pathname.startsWith('/login') || location.pathname.startsWith('/register')) {
      setIsOpen(false);
      return;
    }

    const interval = setInterval(() => {
      setIsOpen(true);
    }, 3 * 60 * 1000); // 3 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, location.pathname]);

  if (isAuthenticated) return null;

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="" size="sm">
      <div className="-mt-4">
        {mode === 'login' ? <Login /> : <Register />}
        
        {/* Toggle */}
        <div className="flex justify-center pt-8">
          <div className="relative flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-full p-1 w-56">
            <div 
              className={`absolute top-1 bottom-1 w-[108px] bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-[#F1F5F9] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${mode === 'login' ? 'translate-x-0' : 'translate-x-[108px]'}`}
            />
            <button onClick={() => setMode('login')} className={`relative z-10 flex-1 text-center py-2 text-[13px] font-semibold transition-colors duration-300 ${mode === 'login' ? 'text-[#0F172A]' : 'text-[#94A3B8] hover:text-[#64748B]'}`}>
              Log in
            </button>
            <button onClick={() => setMode('register')} className={`relative z-10 flex-1 text-center py-2 text-[13px] font-semibold transition-colors duration-300 ${mode === 'register' ? 'text-[#0F172A]' : 'text-[#94A3B8] hover:text-[#64748B]'}`}>
              Sign up
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GlobalLoginPrompt;
