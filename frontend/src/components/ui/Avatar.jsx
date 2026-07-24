const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  if (src) {
    return (
      <div className={`relative ${className}`}>
        <img
          src={src}
          alt={name || 'Avatar'}
          className={`${sizes[size]} rounded-full object-cover ring-2 ring-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]`}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-[#5B4BFF] to-[#7C3AED] flex items-center justify-center font-bold text-white ring-2 ring-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]`}>
        {initial}
      </div>
    </div>
  );
};

export default Avatar;
