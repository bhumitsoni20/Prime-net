import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
      <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm text-sm">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        <p className="text-[#5B4BFF] font-bold">₹{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const RevenueChart = ({ totalRevenue, data = defaultData }) => {
  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[17px] font-bold text-[#1e293b]">Revenue Trend</h2>
        <span className="text-sm text-gray-400">Last 6 months</span>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 13 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 13 }}
              dx={-10}
              tickFormatter={(value) => value >= 1000 ? `₹${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k` : `₹${value}`}
              width={65}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#5B4BFF" 
              strokeWidth={3}
              dot={{ r: 5, fill: '#ffffff', stroke: '#5B4BFF', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#5B4BFF', stroke: '#ffffff', strokeWidth: 2 }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
