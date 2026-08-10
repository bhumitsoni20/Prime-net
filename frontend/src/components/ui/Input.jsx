import { forwardRef, useState } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';

const Input = forwardRef(({ label, error, icon: Icon, className = '', type = 'text', ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-[13px] font-semibold text-[#334155] mb-1.5">{label}</label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200">
            <Icon className="h-[18px] w-[18px] text-[#94A3B8] group-focus-within:text-[#5B4BFF] transition-colors duration-200" />
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          className={`w-full bg-white border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-[#0F172A] text-sm placeholder-[#94A3B8] focus:outline-none focus:ring-[3px] focus:ring-[#5B4BFF]/10 focus:border-[#5B4BFF] transition-all duration-200 hover:border-[#CBD5E1] ${Icon ? 'pl-11' : ''} ${isPassword ? 'pr-11' : ''} ${error ? 'border-[#EF4444] focus:ring-[#EF4444]/10 focus:border-[#EF4444]' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#0F172A] transition-colors duration-200 focus:outline-none"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <HiEyeOff className="h-[18px] w-[18px]" />
            ) : (
              <HiEye className="h-[18px] w-[18px]" />
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-[13px] text-[#EF4444] font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
