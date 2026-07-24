const StatsCard = ({ icon: Icon, label, value, trend, color = 'blue', alert = false }) => {
  const colors = {
    blue: { bg: 'bg-[#EFF6FF]', text: 'text-[#3B82F6]', border: 'border-[#BFDBFE]' },
    purple: { bg: 'bg-[#F3E8FF]', text: 'text-[#7C3AED]', border: 'border-[#DDD6FE]' },
    green: { bg: 'bg-[#F0FDF4]', text: 'text-[#22C55E]', border: 'border-[#BBF7D0]' },
    amber: { bg: 'bg-[#FFFBEB]', text: 'text-[#F59E0B]', border: 'border-[#FDE68A]' },
    orange: { bg: 'bg-[#FFF7ED]', text: 'text-[#F97316]', border: 'border-[#FED7AA]' },
    red: { bg: 'bg-[#FEF2F2]', text: 'text-[#EF4444]', border: 'border-[#FECACA]' },
  };

  const c = colors[color] || colors.blue;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 transition-all duration-300 hover:shadow-[0_6px_16px_-4px_rgba(0,0,0,0.06)] hover:border-[#CBD5E1]">
      <div className="flex items-start justify-between mb-4">
        <div className={`h-11 w-11 rounded-[12px] ${c.bg} border ${c.border} flex items-center justify-center`}>
          {Icon && <Icon className={`w-[18px] h-[18px] ${c.text}`} />}
        </div>
        {trend !== undefined && (
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
            alert ? 'bg-[#FEF2F2] text-[#EF4444]' : trend > 0 ? 'text-[#15803D] bg-[#F0FDF4]' : 'text-[#DC2626] bg-[#FEF2F2]'
          }`}>
            {alert ? '! High' : `${trend > 0 ? '+' : ''}${trend}%`}
            {!alert && <span className="text-[9px]">↗</span>}
          </span>
        )}
      </div>
      <p className="text-[13px] text-[#64748B] font-medium mb-1">{label}</p>
      <p className="text-[22px] font-bold text-[#0F172A] tracking-[-0.02em]">{value}</p>
    </div>
  );
};

export default StatsCard;
