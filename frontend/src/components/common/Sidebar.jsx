import { NavLink, useLocation } from 'react-router-dom';
import { 
  HiHome, 
  HiShoppingBag, 
  HiClipboardList, 
  HiUser, 
  HiCube, 
  HiPlus, 
  HiUsers, 
  HiChartBar, 
  HiCog, 
  HiOutlineTicket, 
  HiSupport, 
  HiChat, 
  HiSparkles, 
  HiTemplate,
  HiCurrencyRupee,
  HiShieldCheck
} from 'react-icons/hi';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';

const Sidebar = () => {
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const { pathname } = useLocation();

  const isSellerContext = pathname.startsWith('/seller');
  const isAdminContext = pathname.startsWith('/admin');
  const isMainContext = !isSellerContext && !isAdminContext;

  const userLinks = [
    { to: '/dashboard', icon: HiHome, label: 'Dashboard', end: true },
    { to: '/dashboard/wallet', icon: HiCurrencyRupee, label: 'My Wallet' },
    { to: '/dashboard/orders', icon: HiClipboardList, label: 'My Orders' },
    { to: '/dashboard/profile', icon: HiUser, label: 'Profile' },
  ];

  const sellerLinks = [
    { to: '/seller', icon: HiChartBar, label: 'Dashboard', end: true },
    { to: '/seller/wallet', icon: HiCurrencyRupee, label: 'Wallet & Payouts' },
    { to: '/seller/products', icon: HiCube, label: 'Inventory', end: true },
    { to: '/seller/bundles', icon: HiShoppingBag, label: 'Bundles', end: true },
    { to: '/seller/products/new', icon: HiPlus, label: 'Add Product' },
    { to: '/seller/orders', icon: HiClipboardList, label: 'Orders' },
    { to: '/seller/product-requests', icon: HiSparkles, label: 'Demand Board' },
  ];

  const adminLinks = [
    { to: '/admin', icon: HiChartBar, label: 'Dashboard', end: true },
    { to: '/admin/users', icon: HiUsers, label: 'Subscribers' },
    { to: '/admin/buyer-refunds', icon: HiCurrencyRupee, label: 'Buyer Refunds' },
    { to: '/admin/payments', icon: HiClipboardList, label: 'Payment Verifications' },
    { to: '/admin/payouts', icon: HiCurrencyRupee, label: 'Seller Payouts' },
    { to: '/admin/applications', icon: HiClipboardList, label: 'Applications' },
    { to: '/admin/products/catalog', icon: HiTemplate, label: 'Product Catalog' },
    { to: '/admin/products', icon: HiCube, label: 'Integrations', end: true },
    { to: '/admin/bundles', icon: HiShoppingBag, label: 'Bundles' },
    { to: '/admin/orders', icon: HiCog, label: 'Orders' },
    { to: '/admin/product-requests', icon: HiSparkles, label: 'Product Requests' },
    { to: '/admin/coupons', icon: HiOutlineTicket, label: 'Coupons' },
    { to: '/admin/payment-settings', icon: HiCog, label: 'Payment Settings' },
  ];

  const renderSection = (title, links) => (
    <div>
      {title && (
        <div className="px-3 mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">{title}</span>
          <span className="text-[10px] font-semibold text-[#5B4BFF] bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            {links.length}
          </span>
        </div>
      )}
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-[13.5px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#5B4BFF]/10 to-[#7C3AED]/5 text-[#5B4BFF] font-semibold shadow-[inset_0_0_0_1px_rgba(91,75,255,0.15)]'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-[#5B4BFF] to-[#7C3AED] rounded-r-full shadow-[0_0_8px_rgba(91,75,255,0.5)]" />
                  )}
                  <div className={`p-1 rounded-[8px] transition-colors ${
                    isActive ? 'bg-[#5B4BFF] text-white shadow-sm' : 'text-[#64748B] group-hover:text-[#0F172A]'
                  }`}>
                    <link.icon className="w-4 h-4 flex-shrink-0" />
                  </div>
                  <span className="truncate">{link.label}</span>
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
        <div 
          className="fixed inset-0 bg-[#0F172A]/20 backdrop-blur-[2px] z-30 lg:hidden transition-opacity" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      <aside className={`fixed top-16 left-0 bottom-0 w-[240px] bg-white/95 backdrop-blur-md border-r border-[#E2E8F0] z-30 overflow-y-auto transition-transform duration-300 lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-3 py-4 flex-1 space-y-6">
          {isMainContext && renderSection('Main Navigation', userLinks)}
          {isSellerContext && (user?.role === 'seller' || user?.role === 'admin') && renderSection('Seller Central', sellerLinks)}
          {isAdminContext && user?.role === 'admin' && renderSection('Admin Operations', adminLinks)}
        </div>

        {/* Bottom Footer with Status */}
        <div className="px-3 py-3 border-t border-[#F1F5F9] bg-[#F8FAFC]/60 space-y-2">
          {isAdminContext && (
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-[10px] border border-indigo-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <HiShieldCheck className="w-4 h-4 text-[#5B4BFF]" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-[#0F172A] truncate">Admin Console</p>
                <p className="text-[10px] text-[#64748B] truncate">Superuser Privileges</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}
          {isSellerContext && (
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-[10px] border border-emerald-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-[#0F172A] truncate">Merchant Portal</p>
                <p className="text-[10px] text-[#10B981] font-semibold truncate">Verified Active Store</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}
          <div className="flex items-center justify-between px-1">
            <NavLink to="/contact" className="flex items-center gap-1.5 px-2 py-1 text-[#94A3B8] hover:text-[#64748B] rounded-[8px] text-[12px] font-medium transition-colors">
              <HiSupport className="w-3.5 h-3.5" /> Support
            </NavLink>
            <NavLink to="/contact" className="flex items-center gap-1.5 px-2 py-1 text-[#94A3B8] hover:text-[#64748B] rounded-[8px] text-[12px] font-medium transition-colors">
              <HiChat className="w-3.5 h-3.5" /> Feedback
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
