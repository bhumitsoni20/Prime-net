import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const data = [
  { name: 'Jan', value: 1200 },
  { name: 'Feb', value: 2100 },
  { name: 'Mar', value: 800 },
  { name: 'Apr', value: 1100 },
  { name: 'May', value: 1900 },
  { name: 'Jun', value: 1000 },
  { name: 'Jul', value: 1400 },
  { name: 'Aug', value: 2500 },
  { name: 'Sep', value: 2200 },
  { name: 'Oct', value: 3100 },
  { name: 'Nov', value: 2800 },
  { name: 'Dec', value: 3800 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#8B8B8B] text-[#0A0C10] px-3 py-1 rounded-full shadow-md text-[11px] font-bold tracking-wide -ml-2 mb-2">
        AVG. ₹{(payload[0].value / 1000).toFixed(2)}K
      </div>
    );
  }
  return null;
};

const CustomCursor = (props) => {
  const { points, width, height } = props;
  const { x, y } = points[0];
  return (
    <rect 
      x={x - 20} 
      y={0} 
      width={40} 
      height={height} 
      fill="#ffffff" 
      fillOpacity={0.03}
      rx={20}
    />
  );
};

const RevenueChart = ({ totalRevenue }) => {
  return (
    <div className="w-full h-full flex flex-col bg-[#0A0C10] rounded-[24px] p-8 shadow-md relative overflow-hidden font-sans">
      <div className="relative z-10 flex flex-col items-center mb-10 mt-2">
        <div className="text-[48px] font-extrabold text-white tracking-tight leading-none font-sans">
          ₹{totalRevenue ? totalRevenue.toLocaleString() : '2,664'}
        </div>
      </div>

      <div className="h-[280px] w-full relative z-10 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C026D3" stopOpacity={0.25}/>
                <stop offset="100%" stopColor="#C026D3" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }}
              dy={15}
              padding={{ left: 20, right: 20 }}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={<CustomCursor />}
              isAnimationActive={true}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#D946EF" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              activeDot={{ r: 7, fill: "#D946EF", stroke: "#0A0C10", strokeWidth: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
