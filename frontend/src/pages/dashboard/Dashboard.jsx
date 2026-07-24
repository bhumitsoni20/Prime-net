import { useQuery } from '@tanstack/react-query';
import { HiCube, HiCurrencyDollar, HiClock } from 'react-icons/hi';
import useAuthStore from '../../store/authStore';
import { getMyOrders } from '../../services/order.service';
import StatsCard from '../../components/common/StatsCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

const Dashboard = () => {
  const { user } = useAuthStore();

  const { data: rawOrders = [], isLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const response = await getMyOrders();
      return response.data || [];
    },
  });

  // Filter out abandoned checkouts where payment was never successfully completed
  const orders = rawOrders.filter(o => o.paymentStatus === 'paid');

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + (order.amount || order.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.orderStatus === 'placed').length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em] mb-1">Command Center</h1>
            <p className="text-[#64748B] text-[15px]">Welcome back, <span className="font-semibold text-[#0F172A]">{user?.name || 'User'}</span>. Here's your account overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-white border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-[13px] shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
              </span>
              <span className="text-[#334155] font-bold tracking-wide uppercase">Live System Status</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatsCard icon={HiCube} label="Total Orders" value={isLoading ? '...' : totalOrders} color="blue" />
        <StatsCard icon={HiCurrencyDollar} label="Total Spent" value={isLoading ? '...' : `₹${totalSpent.toLocaleString()}`} color="purple" />
        <StatsCard icon={HiClock} label="Pending Orders" value={isLoading ? '...' : pendingOrders} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between p-6 border-b border-[#F1F5F9] bg-[#F8FAFC]">
            <h2 className="text-[17px] font-bold text-[#0F172A]">Recent Orders</h2>
            <Link to="/dashboard/orders"><Button variant="secondary" size="sm" className="font-semibold text-[13px]">View All</Button></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-[#F1F5F9] text-left text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] bg-white">
                <th className="p-5 pl-6">Item</th>
                <th className="p-5">Status</th>
                <th className="p-5">Date</th>
                <th className="p-5 pr-6 text-right">Amount</th>
              </tr></thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="p-12 text-center text-[#94A3B8] font-medium animate-pulse">Loading orders...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={4} className="p-12 text-center text-[#64748B] font-medium bg-[#F8FAFC]">No orders yet. Start shopping!</td></tr>
                ) : (
                  orders.slice(0, 5).map((o, i) => (
                    <tr key={i} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors group">
                      <td className="p-5 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-[14px] bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-xl shadow-sm">📦</div>
                          <div>
                            <p className="text-[#0F172A] font-bold text-[14px] line-clamp-1 group-hover:text-[#5B4BFF] transition-colors">{o.product?.title || 'Product Item'}</p>
                            <p className="text-[#94A3B8] text-[12px] font-mono mt-0.5">#{o._id.substring(0,8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <Badge variant={o.orderStatus === 'delivered' ? 'success' : o.orderStatus === 'cancelled' ? 'danger' : 'warning'}>
                          {o.orderStatus || 'Pending'}
                        </Badge>
                      </td>
                      <td className="p-5"><p className="text-[#64748B] text-[14px] font-medium">{dayjs(o.createdAt).format('MMM DD, YYYY')}</p></td>
                      <td className="p-5 pr-6 text-right"><span className="text-[#0F172A] font-extrabold text-[15px]">₹{(o.amount || o.totalAmount || 0).toLocaleString()}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-[#0F172A] rounded-[24px] p-8 text-white relative overflow-hidden shadow-[0_8px_30px_-4px_rgba(15,23,42,0.4)]">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-[#5B4BFF] rounded-full blur-[64px] opacity-40"></div>
            <div className="relative">
              <div className="h-14 w-14 rounded-[16px] bg-white/10 border border-white/20 flex items-center justify-center mb-6 text-2xl backdrop-blur-md shadow-inner">💬</div>
              <h3 className="text-[20px] font-bold mb-3 tracking-tight">Need Help?</h3>
              <p className="text-[#94A3B8] text-[14px] mb-8 leading-relaxed">Our dedicated support team is available 24/7 to assist with your purchases and account needs.</p>
              <Button variant="secondary" className="w-full !bg-white !text-[#0F172A] hover:!bg-[#F8FAFC] border-none font-bold shadow-lg">Contact Support</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
