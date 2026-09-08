const StatsCard = ({ icon: Icon, label, value, trend, color = 'blue', alert = false }) => {
  const colors = {
    blue: {
      bg: 'bg-blue-50/80',
      text: 'text-blue-600',
      border: 'border-blue-100',
      glow: 'from-blue-500/10 to-indigo-500/5',
    },
    purple: {
      bg: 'bg-indigo-50/80',
      text: 'text-[#5B4BFF]',
      border: 'border-indigo-100',
      glow: 'from-[#5B4BFF]/15 to-[#7C3AED]/10',
    },
    green: {
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      glow: 'from-emerald-500/15 to-teal-500/10',
    },
    amber: {
      bg: 'bg-amber-50/80',
      text: 'text-amber-600',
      border: 'border-amber-100',
      glow: 'from-amber-500/15 to-orange-500/10',
    },
    orange: {
      bg: 'bg-orange-50/80',
      text: 'text-orange-600',
      border: 'border-orange-100',
      glow: 'from-orange-500/15 to-amber-500/10',
    },
    red: {
      bg: 'bg-rose-50/80',
      text: 'text-rose-600',
      border: 'border-rose-100',
      glow: 'from-rose-500/15 to-pink-500/10',
    },
  };

  const c = colors[color] || colors.blue;

  return (
    <div className="group relative bg-white border border-[#E2E8F0] rounded-[20px] p-6 transition-all duration-300 hover:shadow-[0_10px_30px_-5px_rgba(91,75,255,0.08)] hover:border-indigo-200 hover:-translate-y-0.5 overflow-hidden">
      {/* Soft gradient accent line on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#5B4BFF]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start justify-between mb-4">
        <div className={`h-12 w-12 rounded-[14px] ${c.bg} border ${c.border} flex items-center justify-center shadow-sm relative group-hover:scale-105 transition-transform`}>
          <div className={`absolute inset-0 rounded-[14px] bg-gradient-to-br ${c.glow} opacity-60`} />
          {Icon && <Icon className={`w-6 h-6 ${c.text} relative z-10`} />}
        </div>
        {trend !== undefined && (
          <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border ${
            alert 
              ? 'bg-rose-50 text-rose-600 border-rose-200' 
              : trend > 0 
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200/80' 
                : 'text-rose-700 bg-rose-50 border-rose-200/80'
          }`}>
            {alert ? '! High Alert' : `${trend > 0 ? '+' : ''}${trend}%`}
            {!alert && <span className="text-[10px]">{trend > 0 ? '↗' : '↘'}</span>}
          </span>
        )}
      </div>
      
      <p className="text-[13.5px] text-[#64748B] font-semibold tracking-wide mb-1.5">{label}</p>
      <p className="text-[26px] font-extrabold text-[#0F172A] tracking-[-0.03em]">{value}</p>
    </div>
  );
};

export default StatsCard;
