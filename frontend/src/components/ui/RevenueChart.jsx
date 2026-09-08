import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const defaultData = [
  { name: 'Feb', value: 0 },
  { name: 'Mar', value: 0 },
  { name: 'Apr', value: 0 },
  { name: 'May', value: 0 },
  { name: 'Jun', value: 0 },
  { name: 'Jul', value: 0 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-indigo-100 px-4 py-3 rounded-[14px] shadow-[0_10px_25px_rgba(91,75,255,0.12)] text-sm">
        <p className="font-bold text-[#64748B] text-[12px] uppercase tracking-wider mb-1">{label}</p>
        <p className="text-[#5B4BFF] font-extrabold text-[16px]">
          ₹{Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const RevenueChart = ({ totalRevenue, data = defaultData }) => {
  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="w-full bg-white rounded-[24px] border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(91,75,255,0.05)] transition-all p-7 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-[19px] font-extrabold text-[#0F172A] tracking-[-0.02em]">Revenue & Volume Growth</h2>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
              Live Feed
            </span>
          </div>
          <p className="text-[13px] text-[#64748B]">Platform gross merchandise volume processed over time</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-[10px] text-[12px] font-bold text-[#475569]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5B4BFF]" />
            Gross Volume
          </div>
          <span className="text-[12px] text-[#94A3B8] font-medium bg-[#F1F5F9] px-3 py-1.5 rounded-[10px]">
            Last 6 Months
          </span>
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5B4BFF" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#5B4BFF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 13, fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 13, fontWeight: 500 }}
              dx={-10}
              tickFormatter={(value) => value >= 1000 ? `₹${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k` : `₹${value}`}
              width={70}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#5B4BFF', strokeWidth: 1.5, strokeDasharray: '4 4' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#5B4BFF" 
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              dot={{ r: 4, fill: '#FFFFFF', stroke: '#5B4BFF', strokeWidth: 2.5 }}
              activeDot={{ r: 7, fill: '#5B4BFF', stroke: '#FFFFFF', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
