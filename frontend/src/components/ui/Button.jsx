const Button = ({ children, variant = 'primary', size = 'md', className = '', disabled = false, loading = false, onClick, type = 'button', ...props }) => {
  const variants = {
    primary: 'bg-[#5B4BFF] hover:bg-[#4F3FE8] text-white shadow-[0_1px_2px_rgba(91,75,255,0.3),0_1px_3px_rgba(91,75,255,0.15)] hover:shadow-[0_4px_14px_rgba(91,75,255,0.35)]',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-gray-300 hover:shadow-[0_2px_4px_rgba(0,0,0,0.06)]',
    danger: 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-[0_1px_2px_rgba(239,68,68,0.3)]',
    success: 'bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-[0_1px_2px_rgba(34,197,94,0.3)]',
    ghost: 'bg-transparent hover:bg-gray-100/80 text-[#64748B] hover:text-[#0F172A]',
    outline: 'bg-transparent hover:bg-[#5B4BFF]/5 text-[#5B4BFF] border border-[#5B4BFF]/20 hover:border-[#5B4BFF]/40',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-[13px]',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-[15px]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-[12px] transition-all duration-200 ease-out cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.97] ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" fill="none" />
          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
