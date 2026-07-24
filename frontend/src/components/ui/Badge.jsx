const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
    success: 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]',
    warning: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
    danger: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
    info: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
    primary: 'bg-[#EEF2FF] text-[#5B4BFF] border-[#C7D2FE]',
    verified: 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
