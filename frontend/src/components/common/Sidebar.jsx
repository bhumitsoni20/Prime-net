import { NavLink } from 'react-router-dom';
import { HiHome, HiShoppingBag, HiClipboardList, HiUser, HiBell, HiCube, HiPlus, HiUsers, HiChartBar, HiCog, HiSupport, HiChat, HiSparkles } from 'react-icons/hi';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';
import Button from '../ui/Button';

const Sidebar = () => {
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  const userLinks = [
    { to: '/dashboard', icon: HiHome, label: 'Dashboard', end: true },
    { to: '/dashboard/orders', icon: HiClipboardList, label: 'My Orders' },
    { to: '/dashboard/profile', icon: HiUser, label: 'Profile' },
  ];

  const sellerLinks = [
    { to: '/seller', icon: HiChartBar, label: 'Dashboard', end: true },
    { to: '/seller/products', icon: HiCube, label: 'Inventory' },
    { to: '/seller/products/new', icon: HiPlus, label: 'Add Product' },
    { to: '/seller/orders', icon: HiClipboardList, label: 'Orders' },
  ];

  const adminLinks = [
    { to: '/admin', icon: HiChartBar, label: 'Dashboard', end: true },
    { to: '/admin/users', icon: HiUsers, label: 'Subscribers' },
    { to: '/admin/applications', icon: HiClipboardList, label: 'Applications' },
    { to: '/admin/products', icon: HiCube, label: 'Integrations' },
    { to: '/admin/orders', icon: HiCog, label: 'Settings' },
  ];

  const renderSection = (title, links) => (
    <div>
      {title && <p className="px-3 mb-2 text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">{title}</p>}
      <ul className="space-y-0.5">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#5B4BFF]/[0.06] text-[#5B4BFF]'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#5B4BFF] rounded-r-full" />}
                  <link.icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {link.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/20 backdrop-blur-[2px] z-30 lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-16 left-0 bottom-0 w-[240px] bg-white/95 backdrop-blur-sm border-r border-[#F1F5F9] z-30 overflow-y-auto transition-transform duration-300 lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand */}
        <div className="px-5 py-4 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-[8px] bg-gradient-to-br from-[#5B4BFF] to-[#7C3AED] flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </div>
            <div>
              <p className="text-[#0F172A] font-bold text-[13px] leading-tight">StreamKart</p>
              <p className="text-[#94A3B8] text-[11px] font-medium">{user?.role === 'admin' ? 'Enterprise' : user?.role === 'seller' ? 'Seller' : 'Dashboard'}</p>
            </div>
          </div>
        </div>

        <div className="px-3 py-4 flex-1 space-y-6">
          {renderSection('Main', userLinks)}
          {(user?.role === 'seller' || user?.role === 'admin') && renderSection('Seller', sellerLinks)}
          {user?.role === 'admin' && renderSection('Admin', adminLinks)}
        </div>

        {/* Bottom */}
        <div className="px-3 py-3 border-t border-[#F1F5F9]">
          <NavLink to="/contact" className="flex items-center gap-2.5 px-3 py-2 text-[#94A3B8] hover:text-[#64748B] hover:bg-[#F8FAFC] rounded-[10px] text-[13px] transition-all font-medium">
            <HiSupport className="w-4 h-4" /> Support
          </NavLink>
          <NavLink to="/contact" className="flex items-center gap-2.5 px-3 py-2 text-[#94A3B8] hover:text-[#64748B] hover:bg-[#F8FAFC] rounded-[10px] text-[13px] transition-all font-medium">
            <HiChat className="w-4 h-4" /> Feedback
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
