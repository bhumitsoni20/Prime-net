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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-[-0.02em] mb-1">Seller Dashboard</h1>
          <p className="text-[#64748B] text-[15px]">Welcome back, <span className="font-semibold text-[#0F172A]">{user?.name}</span>. Here's your shop performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Avatar src={user?.avatar} name={user?.name} size="md" className="ring-2 ring-white shadow-sm" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard icon={HiShoppingBag} label="Total Sales" value={loading ? '...' : `₹${totalSales.toLocaleString()}`} color="blue" />
        <StatsCard icon={HiUsers} label="Active Customers" value={loading ? '...' : uniqueCustomers} color="green" />
        <StatsCard icon={HiStar} label="Total Products" value={loading ? '...' : products.length} color="amber" />
        <StatsCard icon={HiExclamation} label="Pending Orders" value={loading ? '...' : pendingOrders} color="red" alert={pendingOrders > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Forecast (MOCK) */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-[24px] p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[18px] font-bold text-[#0F172A]">Revenue Forecast</h2>
              <p className="text-[#64748B] text-[13px] font-medium mt-1">Estimated earnings for Q3 2024</p>
            </div>
          </div>
          {/* Chart placeholder — bar chart */}
          <div className="flex items-end gap-3 h-52 pt-4">
            {[30, 45, 38, 52, 60, 80, 72, 55, 48, 42, 35, 28].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                <div className={`w-full rounded-t-[6px] transition-all duration-500 hover:opacity-80 cursor-pointer ${i === 5 ? 'bg-[#5B4BFF] shadow-[0_-4px_14px_rgba(91,75,255,0.3)]' : 'bg-[#E2E8F0] hover:bg-[#CBD5E1]'}`} style={{ height: `${h}%` }}>
                  {i === 5 && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-[11px] font-bold px-2 py-1 rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      Peak Sales
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0F172A]"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] px-1">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => <span key={m} className={i === 5 ? 'text-[#5B4BFF]' : ''}>{m}</span>)}
          </div>
        </div>

        {/* Payout Card */}
        <div className="bg-[#0F172A] rounded-[24px] p-7 text-white relative overflow-hidden shadow-[0_8px_30px_-4px_rgba(15,23,42,0.4)]">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[#5B4BFF] rounded-full blur-[48px] opacity-30"></div>
          
          <div className="relative">
            <h3 className="font-bold text-[18px] mb-6 tracking-tight">Available for Payout</h3>
            <div className="bg-white/5 border border-white/10 rounded-[16px] p-5 mb-6 backdrop-blur-md">
              <p className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-[0.08em] mb-1.5">Balance</p>
              <p className="text-[32px] font-extrabold tracking-tight">₹{loading ? '...' : totalSales.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
              <p className="text-[#94A3B8] text-[13px] font-medium">Auto-payout Enabled (Weekly)</p>
            </div>
            <Button className="w-full mb-3 bg-[#5B4BFF] hover:bg-[#4F3FE8] border-none shadow-[0_4px_14px_rgba(91,75,255,0.4)]">Withdraw Funds</Button>
            <Button variant="secondary" className="w-full border-none bg-white/10 text-white hover:bg-white/20">Payout Settings</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Notifications */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-6 border-b border-[#F1F5F9] pb-4">
            <h3 className="font-bold text-[17px] text-[#0F172A]">Notifications</h3>
            <Link to="/notifications"><Button variant="secondary" size="sm" className="font-semibold text-[13px]">View All</Button></Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <p className="text-[#94A3B8] text-[14px] text-center py-6 font-medium animate-pulse">Loading...</p>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 bg-[#F8FAFC] rounded-[16px]">
                <p className="text-[#64748B] text-[14px] font-medium">No recent notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif._id} className="flex items-start gap-4 p-3 rounded-[16px] hover:bg-[#F8FAFC] transition-colors cursor-pointer group">
                  <div className={`h-11 w-11 rounded-[14px] flex items-center justify-center text-xl flex-shrink-0 shadow-sm ${!notif.read ? 'bg-[#EEF2FF] border border-[#E0E7FF] text-[#5B4BFF]' : 'bg-[#F8FAFC] border border-[#F1F5F9] text-[#64748B]'}`}>
                    {notif.type === 'order' ? '📦' : notif.type === 'review' ? '⭐' : '📣'}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className={`text-[14px] leading-tight mb-1 truncate group-hover:text-[#5B4BFF] transition-colors ${!notif.read ? 'text-[#0F172A] font-bold' : 'text-[#334155] font-semibold'}`}>{notif.title}</p>
                    <p className="text-[#64748B] text-[13px] line-clamp-2 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Product Management Table */}
        <div className="lg:col-span-3 bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between p-6 border-b border-[#F1F5F9] bg-[#F8FAFC]">
            <h3 className="font-bold text-[17px] text-[#0F172A]">Recent Products</h3>
            <Link to="/seller/products/new">
              <Button size="sm" className="font-semibold shadow-sm">
                <HiPlus className="w-[18px] h-[18px] mr-1.5" /> Add Product
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-[#F1F5F9] text-left text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] bg-white">
                <th className="p-5 pl-6">Product Name</th>
                <th className="p-5">Status</th>
                <th className="p-5 pr-6 text-right">Price</th>
              </tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="p-12 text-center text-[#94A3B8] font-medium animate-pulse">Loading products...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={3} className="p-12 text-center text-[#64748B] font-medium bg-[#F8FAFC]">No products yet. Add your first product!</td></tr>
                ) : (
                  products.map((p) => (
                    <tr key={p._id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors group cursor-pointer">
                      <td className="p-5 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-[14px] bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#5B4BFF] text-xl font-extrabold shadow-sm">{p.title[0]}</div>
                          <span className="text-[#0F172A] font-bold text-[14px] group-hover:text-[#5B4BFF] transition-colors">{p.title}</span>
                        </div>
                      </td>
                      <td className="p-5"><Badge variant={p.status === 'active' ? 'success' : p.status === 'pending' ? 'warning' : 'gray'}>{p.status.toUpperCase()}</Badge></td>
                      <td className="p-5 pr-6 text-right"><span className="text-[#0F172A] font-extrabold text-[15px]">₹{p.price.toLocaleString()}</span></td>
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
