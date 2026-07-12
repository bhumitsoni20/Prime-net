import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMenu, HiX, HiShoppingCart, HiBell, HiSearch, HiPlay, HiChatAlt2 } from 'react-icons/hi';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import { apiGet } from '../../services/api';
import { signOut } from '../../firebase/auth';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const { user, isAuthenticated } = useAuthStore();
  const itemCount = useCartStore((s) => s.items.length);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUnreadCount = async () => {
        try {
          const res = await apiGet('/notifications/unread-count');
          setUnreadCount(res.data?.count || 0);
        } catch (error) {
          console.error('Failed to fetch unread count', error);
        }
      };
      fetchUnreadCount();
      
      // Optional: poll every minute for new notifications
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { label: 'Marketplace', to: '/products' },
    { label: 'Features', to: '/about' },
    { label: 'Pricing', to: '/products' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
            <img src="/streamkart_logo.png" alt="StreamKart" className="h-16 scale-[1.35] w-auto object-contain origin-left ml-4" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.to} className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user?.role === 'user' && (
                  <Link 
                    to="/dashboard/apply-seller" 
                    className="hidden sm:flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition-colors mr-2"
                  >
                    Become a Seller
                  </Link>
                )}
                <button onClick={() => navigate('/search')} className="p-2 text-gray-500 hover:text-gray-700 transition-colors hidden sm:block">
                  <HiSearch className="w-5 h-5" />
                </button>
                <Link to="/wishlist" className="relative p-2 text-gray-500 hover:text-pink-500 transition-colors hidden sm:block">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </Link>
                <Link to="/notifications" className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
                  <HiBell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </Link>
                <Link to="/dashboard/chats" className="relative p-2 text-gray-500 hover:text-indigo-600 transition-colors" title="Chats">
                  <HiChatAlt2 className="w-5 h-5" />
                </Link>
                <Link to="/cart" className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
                  <HiShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <div className="relative ml-1" ref={dropdownRef}>
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Avatar src={user?.avatar} name={user?.name} size="sm" />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 animate-slideDown">
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-gray-900 text-sm font-medium truncate" title={user?.name}>{user?.name}</p>
                        <p className="text-gray-500 text-xs truncate" title={user?.email}>{user?.email}</p>
                      </div>
                      <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Dashboard</Link>
                      <Link to="/dashboard/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Profile</Link>
                      {(user?.role === 'seller' || user?.role === 'admin') && (
                        <Link to="/seller" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Seller Panel</Link>
                      )}
                      {user?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Admin Panel</Link>
                      )}
                      <div className="border-t border-gray-100 mt-1">
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">Sign Out</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/dashboard/apply-seller" className="hidden sm:block text-sm font-medium text-indigo-600 hover:text-indigo-500 mr-2">
                  Become a Seller
                </Link>
                <Link to="/login"><Button variant="ghost" size="sm">Log In</Button></Link>
                <Link to="/register"><Button size="sm">Get Started</Button></Link>
              </div>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-500 hover:text-gray-700">
              {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-slideDown">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.to} onClick={() => setMobileOpen(false)} className="block py-2.5 text-gray-600 hover:text-gray-900 transition-colors font-medium">
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
