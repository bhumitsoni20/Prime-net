import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllOrders } from '../../services/admin.service';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { 
  HiSearch, 
  HiClipboardCopy, 
  HiOutlineShoppingBag, 
  HiOutlineCheckCircle, 
  HiOutlineClock, 
  HiOutlineXCircle,
  HiOutlineCurrencyRupee
} from 'react-icons/hi';

const ManageOrders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const response = await getAllOrders(1, 100);
      return response.data || [];
    },
  });

  const stats = useMemo(() => {
    const totalCount = orders.length;
    const totalVolume = orders.reduce((acc, o) => acc + (Number(o.amount || o.totalAmount || 0)), 0);
    const delivered = orders.filter(o => o.orderStatus === 'delivered' || o.orderStatus === 'completed').length;
    const pending = orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'processing').length;
    const cancelled = orders.filter(o => o.orderStatus === 'cancelled' || o.orderStatus === 'failed').length;

    return { totalCount, totalVolume, delivered, pending, cancelled };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch = 
        order._id?.toLowerCase().includes(searchStr) || 
        order.user?.name?.toLowerCase().includes(searchStr) || 
        order.user?.email?.toLowerCase().includes(searchStr) || 
        order.product?.title?.toLowerCase().includes(searchStr);
      
      const matchesStatus = 
        selectedStatus === 'all' || 
        (selectedStatus === 'delivered' && (order.orderStatus === 'delivered' || order.orderStatus === 'completed')) ||
        (selectedStatus === 'pending' && (order.orderStatus === 'pending' || order.orderStatus === 'processing')) ||
        (selectedStatus === 'cancelled' && (order.orderStatus === 'cancelled' || order.orderStatus === 'failed'));

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[26px] font-extrabold text-[#0F172A] tracking-[-0.02em]">Manage Orders</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF2FF] text-[#5B4BFF] border border-[#E0E7FF]">
              {orders.length} Global Orders
            </span>
          </div>
          <p className="text-[#64748B] text-[14px]">Inspect and monitor all platform customer orders and fulfillment pipelines.</p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Total Volume</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#EEF2FF] text-[#5B4BFF] flex items-center justify-center">
              <HiOutlineCurrencyRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#0F172A]">
            ₹{stats.totalVolume.toLocaleString('en-IN')}
          </div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">{stats.totalCount} lifetime orders</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Fulfilled</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <HiOutlineCheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#10B981]">{stats.delivered}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Delivered successfully</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">In Processing</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center">
              <HiOutlineClock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#F59E0B]">{stats.pending}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Awaiting credentials</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Cancelled / Failed</span>
            <div className="w-9 h-9 rounded-[12px] bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center">
              <HiOutlineXCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-[#EF4444]">{stats.cancelled}</div>
          <div className="text-[12px] text-[#64748B] font-medium mt-1">Voided or refunded</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F8FAFC] border border-[#F1F5F9] rounded-[16px] overflow-x-auto">
            {[
              { id: 'all', label: 'All Orders', count: stats.totalCount },
              { id: 'delivered', label: 'Delivered', count: stats.delivered },
              { id: 'pending', label: 'Pending', count: stats.pending },
              { id: 'cancelled', label: 'Cancelled', count: stats.cancelled }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-[12px] text-[13px] font-bold transition-all whitespace-nowrap ${
                  selectedStatus === tab.id
                    ? 'bg-white text-[#5B4BFF] shadow-sm border border-[#E2E8F0]'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  selectedStatus === tab.id
                    ? 'bg-[#EEF2FF] text-[#5B4BFF]'
                    : 'bg-[#E2E8F0] text-[#64748B]'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-[300px]">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search Order ID, user, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-[14px] py-2.5 pl-10 pr-4 text-[13px] font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#5B4BFF] focus:ring-4 focus:ring-[#5B4BFF]/10 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-left text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] bg-[#F8FAFC]">
                <th className="p-4 pl-6">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Product / Item</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 pr-6 text-center">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-[#94A3B8] font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-[#5B4BFF] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-semibold">Loading orders stream...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-16 h-16 rounded-[20px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-2xl mb-4 shadow-sm">
                        🛍️
                      </div>
                      <h3 className="text-[17px] font-bold text-[#0F172A] mb-1">No orders found</h3>
                      <p className="text-[13px] text-[#64748B] mb-4">No transactions match your current search criteria.</p>
                      {(searchQuery || selectedStatus !== 'all') && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedStatus('all');
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order._id} className="hover:bg-[#F8FAFC] transition-colors group">
                    {/* Order ID */}
                    <td className="p-4 pl-6">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(order._id);
                          toast.success('Order ID copied!');
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#F8FAFC] hover:bg-[#EEF2FF] border border-[#E2E8F0] hover:border-[#C7D2FE] text-[12px] font-mono font-bold text-[#475569] hover:text-[#5B4BFF] transition-all group-hover:border-[#C7D2FE]"
                        title="Click to copy full Order ID"
                      >
                        <HiClipboardCopy className="w-3.5 h-3.5" />
                        #{order._id.substring(0, 8)}
                      </button>
                    </td>

                    {/* Customer Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#EEF2FF] border border-[#E0E7FF] text-[#5B4BFF] flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                          {(order.user?.name || order.user?.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold text-[#0F172A] truncate max-w-[150px]">
                            {order.user?.name || 'Customer'}
                          </div>
                          <div className="text-[11px] text-[#64748B] truncate max-w-[150px]">
                            {order.user?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Product */}
                    <td className="p-4">
                      <div className="font-bold text-[14px] text-[#0F172A] group-hover:text-[#5B4BFF] transition-colors truncate max-w-[220px]">
                        {order.product?.title || 'Digital Product'}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] font-medium">
                        {order.product?.category ? `${order.product.category} • ` : ''}
                        Instant Digital Delivery
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="p-4 text-right">
                      <div className="text-[15px] font-extrabold text-[#0F172A]">
                        ₹{Number(order.amount || order.totalAmount || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-[#10B981] font-semibold">
                        {order.paymentMethod || 'UPI / QR'}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="p-4">
                      <div className="text-[13px] font-semibold text-[#334155]">
                        {dayjs(order.createdAt).format('MMM DD, YYYY')}
                      </div>
                      <div className="text-[11px] text-[#94A3B8]">
                        {dayjs(order.createdAt).format('hh:mm A')}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4 pr-6 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.06em] shadow-sm border ${
                        order.orderStatus === 'delivered' || order.orderStatus === 'completed'
                          ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                          : order.orderStatus === 'cancelled' || order.orderStatus === 'failed'
                          ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]'
                          : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          order.orderStatus === 'delivered' || order.orderStatus === 'completed'
                            ? 'bg-[#10B981]'
                            : order.orderStatus === 'cancelled' || order.orderStatus === 'failed'
                            ? 'bg-[#EF4444]'
                            : 'bg-[#F59E0B]'
                        }`}></span>
                        {order.orderStatus}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageOrders;
