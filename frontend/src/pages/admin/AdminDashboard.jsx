import { HiUsers, HiCube, HiShoppingBag, HiCurrencyRupee } from 'react-icons/hi';
import StatsCard from '../../components/common/StatsCard';
import { getDashboardStats } from '../../services/admin.service';
import { useQuery } from '@tanstack/react-query';
import RevenueChart from '../../components/ui/RevenueChart';

const AdminDashboard = () => {
  const { data: stats = { totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 }, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await getDashboardStats();
      return response.data;
    },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em] mb-1">Admin Dashboard</h1>
          <p className="text-[#64748B] text-[15px]">Platform overview and live statistics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-white border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-[13px] shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <span className="text-[#334155] font-bold tracking-wide uppercase">System Healthy</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard icon={HiUsers} label="Total Users" value={isLoading ? '...' : stats.totalUsers} color="blue" />
        <StatsCard icon={HiCube} label="Total Products" value={isLoading ? '...' : stats.totalProducts} color="purple" />
        <StatsCard icon={HiShoppingBag} label="Total Orders" value={isLoading ? '...' : stats.totalOrders} color="green" />
        <StatsCard icon={HiCurrencyRupee} label="Revenue" value={isLoading ? '...' : `₹${stats.totalRevenue.toLocaleString()}`} color="amber" />
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow mb-8">
        <h2 className="text-[18px] font-bold text-[#0F172A] mb-4">Platform Overview</h2>
        {isLoading ? (
          <p className="text-[#94A3B8] text-[14px] font-medium animate-pulse">Loading live statistics...</p>
        ) : (
          <p className="text-[#64748B] text-[15px] leading-relaxed">
            The platform is currently serving <span className="font-extrabold text-[#0F172A]">{stats.totalUsers}</span> active users. 
            There are <span className="font-extrabold text-[#0F172A]">{stats.totalProducts}</span> products listed across the catalog, generating a total of <span className="font-extrabold text-[#0F172A]">{stats.totalOrders}</span> orders.
          </p>
        )}
      </div>

      <div className="w-full">
        <RevenueChart totalRevenue={stats.totalRevenue} />
      </div>
    </div>
  );
};

export default AdminDashboard;
