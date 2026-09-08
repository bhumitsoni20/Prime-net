import { useEffect, useState } from 'react';
import { 
  HiShoppingBag, 
  HiUsers, 
  HiCube, 
  HiClock, 
  HiPlus, 
  HiCurrencyRupee, 
  HiArrowSmUp, 
  HiCheckCircle, 
  HiOutlineSparkles,
  HiOutlineShieldCheck
} from 'react-icons/hi';
import useAuthStore from '../../store/authStore';
import { getSellerProducts } from '../../services/product.service';
import { getSellerOrders } from '../../services/order.service';
import { getNotifications } from '../../services/notification.service';
import { getSellerWallet } from '../../services/seller.service';
import StatsCard from '../../components/common/StatsCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import RevenueChart from '../../components/ui/RevenueChart';
import { generateLast6MonthsData } from '../../utils/chartHelpers';

const SellerDashboard = () => {
  const { user } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, orderRes, notifRes, walletRes] = await Promise.all([
          getSellerProducts('limit=10'),
          getSellerOrders('limit=100'),
          getNotifications('limit=5'),
          getSellerWallet().catch(() => ({ data: { balance: 0 } }))
        ]);
        setProducts(prodRes.data || []);
        setOrders(orderRes.data || []);
        setNotifications(notifRes.data || []);
        setWalletBalance(walletRes?.data?.balance ?? user?.walletBalance ?? 0);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Accurate total gross sales from completed/paid orders
  const totalSales = orders
    .filter(o => o.paymentStatus === 'paid' || o.orderStatus === 'completed' || o.orderStatus === 'delivered')
    .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  const pendingOrders = orders.filter(o => o.orderStatus === 'placed' && o.paymentStatus === 'paid').length;
  // unique customers
  const uniqueCustomers = new Set(orders.map(o => o.user?._id).filter(Boolean)).size;

  return (
    <div className="space-y-8">
      {/* Header Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-4">
          <Avatar 
            src={user?.avatar} 
            name={user?.name} 
            size="lg" 
            className="ring-4 ring-[#EEF2FF] shadow-sm border border-[#E2E8F0]" 
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[24px] sm:text-[26px] font-extrabold text-[#0F172A] tracking-[-0.02em]">
                {user?.name || 'Seller Central'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                <HiCheckCircle className="w-3.5 h-3.5 text-[#10B981]" /> Verified Merchant
              </span>
            </div>
            <p className="text-[#64748B] text-[14px]">
              Here is your digital storefront performance and live customer order pipeline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/seller/products/new">
            <Button size="md" className="shadow-[0_4px_14px_rgba(91,75,255,0.25)] flex items-center gap-1.5 font-bold">
              <HiPlus className="w-4 h-4" /> Add Product
            </Button>
          </Link>
          <Link to="/seller/bundles/create">
            <Button size="md" variant="secondary" className="border-[#E2E8F0] flex items-center gap-1.5 font-bold">
              <HiOutlineSparkles className="w-4 h-4 text-[#5B4BFF]" /> Create Bundle
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          icon={HiCurrencyRupee} 
          label="Total Gross Sales" 
          value={loading ? '...' : `₹${totalSales.toLocaleString('en-IN')}`} 
          color="blue" 
        />
        <StatsCard 
          icon={HiUsers} 
          label="Active Buyers" 
          value={loading ? '...' : uniqueCustomers} 
          color="green" 
        />
        <StatsCard 
          icon={HiCube} 
          label="Listed Products" 
          value={loading ? '...' : products.length} 
          color="purple" 
        />
        <StatsCard 
          icon={HiClock} 
          label="Pending Orders" 
          value={loading ? '...' : pendingOrders} 
          color="amber" 
          alert={pendingOrders > 0} 
        />
      </div>

      {/* Analytics & Payout Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Analytics Chart */}
        <div className="lg:col-span-2">
          <RevenueChart totalRevenue={totalSales} data={generateLast6MonthsData(orders)} />
        </div>

        {/* Luminous Payout Card (Strict Light Mode) */}
        <div className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#EEF2FF] rounded-[24px] p-7 border border-[#C7D2FE]/60 shadow-[0_4px_20px_rgba(91,75,255,0.06)] relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-gradient-to-br from-[#5B4BFF]/20 to-[#7C3AED]/20 rounded-full blur-[32px] pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-extrabold text-[#5B4BFF] uppercase tracking-[0.08em] bg-[#EEF2FF] px-2.5 py-1 rounded-full border border-[#E0E7FF]">
                Instant Merchant Payout
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                <span className="text-[11px] font-bold text-[#10B981]">24h SLA Active</span>
              </div>
            </div>

            <h3 className="text-[16px] font-bold text-[#64748B] mb-1">Available for Withdrawal</h3>
            
            <div className="text-[34px] font-black text-[#0F172A] tracking-tight mb-2">
              ₹{loading ? '...' : (walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            <p className="text-[12px] text-[#64748B] leading-relaxed mb-6">
              95% net sales earnings deposited into your registered UPI ID / QR code within 24 hours.
            </p>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-[#E2E8F0]">
            <Link to="/seller/wallet" className="block">
              <Button className="w-full bg-[#5B4BFF] hover:bg-[#4F3FE8] text-white font-bold shadow-[0_4px_14px_rgba(91,75,255,0.25)] flex items-center justify-center gap-2">
                <HiArrowSmUp className="w-4 h-4" /> Withdraw Funds Now
              </Button>
            </Link>
            <Link to="/seller/wallet" className="block">
              <Button variant="secondary" className="w-full border-[#E2E8F0] font-bold text-[13px]">
                Wallet & Payout Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Notifications and Recent Products */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Notifications */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 border-b border-[#F1F5F9] pb-4">
              <h3 className="font-extrabold text-[17px] text-[#0F172A]">Store Alerts</h3>
              <Link to="/notifications">
                <span className="text-[12px] font-bold text-[#5B4BFF] hover:underline">View All</span>
              </Link>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <p className="text-[#94A3B8] text-[13px] text-center py-6 font-medium animate-pulse">Loading alerts...</p>
              ) : notifications.length === 0 ? (
                <div className="text-center py-10 bg-[#F8FAFC] rounded-[16px]">
                  <p className="text-[#64748B] text-[13px] font-semibold">No pending notifications</p>
                </div>
              ) : (
                notifications.slice(0, 4).map((notif) => (
                  <div key={notif._id} className="flex items-start gap-3 p-3 rounded-[16px] hover:bg-[#F8FAFC] transition-colors cursor-pointer group border border-transparent hover:border-[#E2E8F0]">
                    <div className={`h-10 w-10 rounded-[12px] flex items-center justify-center text-lg flex-shrink-0 shadow-xs ${!notif.read ? 'bg-[#EEF2FF] border border-[#E0E7FF] text-[#5B4BFF]' : 'bg-[#F8FAFC] border border-[#F1F5F9] text-[#64748B]'}`}>
                      {notif.type === 'order' ? '📦' : notif.type === 'review' ? '⭐' : '📣'}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className={`text-[13.5px] leading-tight mb-1 truncate group-hover:text-[#5B4BFF] transition-colors ${!notif.read ? 'text-[#0F172A] font-bold' : 'text-[#334155] font-semibold'}`}>
                        {notif.title}
                      </p>
                      <p className="text-[#64748B] text-[12px] line-clamp-2 leading-relaxed">
                        {(notif.message || '').replace(/\?(\d)/g, '₹$1')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Products Table */}
        <div className="lg:col-span-3 bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between p-6 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <div>
                <h3 className="font-extrabold text-[17px] text-[#0F172A]">Recent Inventory</h3>
                <p className="text-[12px] text-[#64748B]">Your most recently updated product listings</p>
              </div>
              <Link to="/seller/products">
                <Button size="sm" variant="secondary" className="font-bold text-[12px] border-[#E2E8F0]">
                  View All ({products.length})
                </Button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F1F5F9] text-left text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] bg-white">
                    <th className="p-4 pl-6">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {loading ? (
                    <tr><td colSpan={4} className="p-12 text-center text-[#94A3B8] font-medium animate-pulse">Loading inventory...</td></tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-[#64748B] font-medium bg-[#F8FAFC]">
                        No products added yet. Click "+ Add Product" to publish your first item!
                      </td>
                    </tr>
                  ) : (
                    products.slice(0, 5).map((p) => (
                      <tr key={p._id} className="hover:bg-[#F8FAFC] transition-colors group">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            {p.logo ? (
                              <div className="w-10 h-10 rounded-[10px] border border-[#E2E8F0] bg-white shadow-xs overflow-hidden flex-shrink-0 p-1 flex items-center justify-center">
                                <img src={p.logo} alt={p.title} className="max-w-full max-h-full object-contain" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-[10px] bg-[#EEF2FF] border border-[#E0E7FF] text-[#5B4BFF] flex items-center justify-center text-sm font-extrabold shadow-xs flex-shrink-0">
                                {p.title?.[0] || 'P'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="text-[#0F172A] font-bold text-[14px] group-hover:text-[#5B4BFF] transition-colors block truncate max-w-[180px]">
                                {p.title}
                              </span>
                              {p.duration && (
                                <span className="text-[11px] font-semibold text-[#64748B]">
                                  {p.duration}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-[12px] font-semibold text-[#64748B] capitalize">
                            {p.category || 'General'}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge variant={p.status === 'active' ? 'success' : p.status === 'pending' ? 'warning' : 'gray'}>
                            {p.status?.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <span className="text-[#0F172A] font-extrabold text-[15px]">
                            ₹{Number(p.price || 0).toLocaleString('en-IN')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
