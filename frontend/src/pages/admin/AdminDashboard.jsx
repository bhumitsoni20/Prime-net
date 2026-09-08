import { 
  HiUsers, 
  HiCube, 
  HiShoppingBag, 
  HiCurrencyRupee,
  HiShieldCheck,
  HiClock,
  HiArrowSmRight,
  HiCreditCard,
  HiDocumentText,
  HiSparkles
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import StatsCard from '../../components/common/StatsCard';
import { getDashboardStats } from '../../services/admin.service';
import { useQuery } from '@tanstack/react-query';
import RevenueChart from '../../components/ui/RevenueChart';

const AdminDashboard = () => {
  const { data: stats = { totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 }, isLoading, refetch } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await getDashboardStats();
      return response.data;
    },
  });

  const quickActions = [
    {
      title: 'Payment Verifications',
      desc: 'Review pending UPI payment receipts',
      to: '/admin/payments',
      icon: HiCreditCard,
      color: 'purple',
      badge: 'Action Required',
    },
    {
      title: 'Seller Payouts',
      desc: 'Process seller withdrawal requests',
      to: '/admin/payouts',
      icon: HiCurrencyRupee,
      color: 'amber',
      badge: 'Escrow Ledger',
    },
    {
      title: 'Seller Applications',
      desc: 'Moderate merchant onboarding KYC',
      to: '/admin/applications',
      icon: HiDocumentText,
      color: 'blue',
      badge: 'Onboarding',
    },
    {
      title: 'Master Catalog',
      desc: 'Manage verified subscription plans',
      to: '/admin/products/catalog',
      icon: HiCube,
      color: 'green',
      badge: 'Inventory',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="text-[26px] sm:text-[30px] font-extrabold text-[#0F172A] tracking-[-0.03em]">
              Admin Overview
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#5B4BFF]/10 text-[#5B4BFF] border border-[#5B4BFF]/20">
              <HiSparkles className="w-3.5 h-3.5" /> Live Monitor
            </span>
          </div>
          <p className="text-[#64748B] text-[14.5px]">
            Real-time platform metrics, transactions, and system health status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-emerald-50/90 border border-emerald-200/80 rounded-[14px] px-4 py-2.5 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-800 text-[12.5px] font-extrabold tracking-wider uppercase">
              All Systems Operational
            </span>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard 
          icon={HiUsers} 
          label="Total Subscribers" 
          value={isLoading ? '...' : (stats.totalUsers || 0).toLocaleString()} 
          color="blue" 
          trend={8.4}
        />
        <StatsCard 
          icon={HiCube} 
          label="Active Products" 
          value={isLoading ? '...' : (stats.totalProducts || 0).toLocaleString()} 
          color="purple" 
          trend={3.2}
        />
        <StatsCard 
          icon={HiShoppingBag} 
          label="Completed Orders" 
          value={isLoading ? '...' : (stats.totalOrders || 0).toLocaleString()} 
          color="green" 
          trend={14.8}
        />
        <StatsCard 
          icon={HiCurrencyRupee} 
          label="Gross Revenue" 
          value={isLoading ? '...' : `₹${(stats.totalRevenue || 0).toLocaleString()}`} 
          color="amber" 
          trend={12.5}
        />
      </div>

      {/* Quick Action Hub */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-[17px] font-bold text-[#0F172A] tracking-[-0.01em]">Operational Quick Actions</h2>
          <span className="text-[13px] text-[#64748B]">Immediate moderation shortcuts</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group bg-white rounded-[20px] p-5 border border-[#E2E8F0] hover:border-indigo-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(91,75,255,0.06)] hover:-translate-y-0.5 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${
                    action.color === 'purple' ? 'bg-indigo-50 text-[#5B4BFF]' :
                    action.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                    action.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#475569]">
                    {action.badge}
                  </span>
                </div>
                <h3 className="font-bold text-[15px] text-[#0F172A] group-hover:text-[#5B4BFF] transition-colors mb-1">
                  {action.title}
                </h3>
                <p className="text-[12.5px] text-[#64748B] leading-relaxed">
                  {action.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[12px] font-bold text-[#5B4BFF] group-hover:translate-x-0.5 transition-transform">
                <span>Manage</span>
                <HiArrowSmRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Revenue Area Chart */}
      <div className="w-full">
        <RevenueChart totalRevenue={stats.totalRevenue} data={stats.monthlyRevenue} />
      </div>

      {/* Platform Overview Bento */}
      <div className="bg-gradient-to-br from-white via-white to-indigo-50/20 border border-[#E2E8F0] rounded-[24px] p-7 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#5B4BFF] to-[#7C3AED] text-white flex items-center justify-center shadow-sm">
            <HiShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-[#0F172A]">Platform Performance & Escrow Guarantee</h2>
            <p className="text-[13px] text-[#64748B]">Audited overview of platform operations and liquidity</p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-[#94A3B8] text-[14px] font-medium animate-pulse">Loading live telemetry...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-white/80 border border-slate-200/80 rounded-[16px] p-4">
              <p className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Active Accounts</p>
              <p className="text-[20px] font-extrabold text-[#0F172A]">{stats.totalUsers} registered users</p>
              <p className="text-[12px] text-[#64748B] mt-1">Verified buyer and merchant profiles</p>
            </div>
            <div className="bg-white/80 border border-slate-200/80 rounded-[16px] p-4">
              <p className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Catalog Listings</p>
              <p className="text-[20px] font-extrabold text-[#0F172A]">{stats.totalProducts} live passes</p>
              <p className="text-[12px] text-[#64748B] mt-1">Distributed across OTT, AI, & VPN tiers</p>
            </div>
            <div className="bg-white/80 border border-slate-200/80 rounded-[16px] p-4">
              <p className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Order Volume</p>
              <p className="text-[20px] font-extrabold text-[#0F172A]">{stats.totalOrders} fulfilled</p>
              <p className="text-[12px] text-[#64748B] mt-1">100% automated & manual delivery</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
