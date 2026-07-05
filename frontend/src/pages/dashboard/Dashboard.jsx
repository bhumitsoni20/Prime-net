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
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Command Center</h1>
            <p className="text-gray-500 text-sm">Welcome back, {user?.name || 'User'}. Here's your account overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-gray-700 font-medium">Live System Status</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard icon={HiCube} label="Total Orders" value={isLoading ? '...' : totalOrders} color="blue" />
        <StatsCard icon={HiCurrencyDollar} label="Total Spent" value={isLoading ? '...' : `₹${totalSpent.toLocaleString()}`} color="purple" />
        <StatsCard icon={HiClock} label="Pending Orders" value={isLoading ? '...' : pendingOrders} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/dashboard/orders"><Button variant="secondary" size="sm">View All</Button></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="p-4">Item</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
              </tr></thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500 animate-pulse">Loading orders...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">No orders yet. Start shopping!</td></tr>
                ) : (
                  orders.slice(0, 5).map((o, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-lg">📦</div>
                          <div>
                            <p className="text-gray-900 font-medium text-sm line-clamp-1">{o.product?.title || 'Product Item'}</p>
                            <p className="text-gray-400 text-xs">#{o._id.substring(0,8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={o.orderStatus === 'delivered' ? 'success' : o.orderStatus === 'cancelled' ? 'danger' : 'warning'}>
                          {o.orderStatus || 'Pending'}
                        </Badge>
                      </td>
                      <td className="p-4"><p className="text-gray-700 text-sm">{dayjs(o.createdAt).format('MMM DD, YYYY')}</p></td>
                      <td className="p-4"><span className="text-gray-900 font-semibold text-sm">₹{(o.amount || o.totalAmount || 0).toLocaleString()}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
            <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 text-2xl">💬</div>
            <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">Our dedicated support team is available 24/7 to assist with your purchases and account needs.</p>
            <Button variant="secondary" className="w-full !bg-white !text-gray-900 hover:!bg-gray-50">Contact Support</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
