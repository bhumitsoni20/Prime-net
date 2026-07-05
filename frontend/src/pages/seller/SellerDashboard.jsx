import { useEffect, useState } from 'react';
import { HiShoppingBag, HiUsers, HiStar, HiExclamation, HiPlus, HiPencil, HiDotsVertical } from 'react-icons/hi';
import useAuthStore from '../../store/authStore';
import { getSellerProducts } from '../../services/product.service';
import { getSellerOrders } from '../../services/order.service';
import { getNotifications } from '../../services/notification.service';
import StatsCard from '../../components/common/StatsCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const SellerDashboard = () => {
  const { user } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, orderRes, notifRes] = await Promise.all([
          getSellerProducts('limit=10'),
          getSellerOrders(),
          getNotifications('limit=5')
        ]);
        setProducts(prodRes.data || []);
        setOrders(orderRes.data || []);
        setNotifications(notifRes.data || []);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalSales = orders.filter(o => o.paymentStatus === 'paid').reduce((acc, curr) => acc + (curr.amount || curr.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.orderStatus === 'placed' && o.paymentStatus === 'paid').length;
  // unique customers
  const uniqueCustomers = new Set(orders.map(o => o.user?._id)).size;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, {user?.name}. Here's your shop performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Avatar src={user?.avatar} name={user?.name} size="sm" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard icon={HiShoppingBag} label="Total Sales" value={loading ? '...' : `₹${totalSales.toLocaleString()}`} color="blue" />
        <StatsCard icon={HiUsers} label="Active Customers" value={loading ? '...' : uniqueCustomers} color="green" />
        <StatsCard icon={HiStar} label="Total Products" value={loading ? '...' : products.length} color="amber" />
        <StatsCard icon={HiExclamation} label="Pending Orders" value={loading ? '...' : pendingOrders} color="red" alert={pendingOrders > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Forecast (MOCK) */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Revenue Forecast</h2>
              <p className="text-gray-500 text-sm">Estimated earnings for Q3 2024</p>
            </div>
          </div>
          {/* Chart placeholder — bar chart */}
          <div className="flex items-end gap-2 h-48 pt-4">
            {[30, 45, 38, 52, 60, 80, 72, 55, 48, 42, 35, 28].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-lg transition-all duration-500 ${i === 5 ? 'bg-indigo-600' : 'bg-indigo-200'}`} style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => <span key={m}>{m}</span>)}
          </div>
        </div>

        {/* Payout Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Available for Payout</h3>
          <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1">Balance</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">₹{loading ? '...' : totalSales.toLocaleString()}</p>
          <p className="text-gray-500 text-sm mb-5">Auto-payout Enabled (Weekly)</p>
          <Button className="w-full mb-2">Withdraw Funds</Button>
          <Button variant="secondary" className="w-full mb-3">Payout Settings</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Notifications */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <Link to="/notifications"><Button variant="ghost" size="sm">View All</Button></Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-500 text-sm text-center py-4">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No recent notifications</p>
            ) : (
              notifications.map((notif) => (
                <div key={notif._id} className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${!notif.read ? 'bg-indigo-50 border border-indigo-100' : 'bg-gray-50'}`}>
                    {notif.type === 'order' ? '📦' : notif.type === 'review' ? '⭐' : '📣'}
                  </div>
                  <div>
                    <p className={`text-sm ${!notif.read ? 'text-gray-900 font-bold' : 'text-gray-700 font-medium'}`}>{notif.title}</p>
                    <p className="text-gray-500 text-sm">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Product Management Table */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Recent Products</h3>
            <Link to="/seller/products/new"><Button size="sm"><HiPlus className="w-4 h-4 mr-1" /> Add Product</Button></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="p-4">Product Name</th>
                <th className="p-4">Status</th>
                <th className="p-4">Price</th>
              </tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="p-8 text-center text-gray-500">Loading products...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center text-gray-500">No products yet. Add your first product!</td></tr>
                ) : (
                  products.map((p) => (
                    <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-sm font-bold">{p.title[0]}</div>
                          <span className="text-gray-900 font-medium text-sm">{p.title}</span>
                        </div>
                      </td>
                      <td className="p-4"><Badge variant={p.status === 'active' ? 'success' : p.status === 'pending' ? 'warning' : 'gray'}>{p.status.toUpperCase()}</Badge></td>
                      <td className="p-4"><span className="text-gray-900 font-medium text-sm">₹{p.price.toLocaleString()}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
