export const ShinyText = ({ text, disabled = false, speed = 3.5, className = '' }) => {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent bg-gradient-to-r from-[#5B4BFF] via-[#A855F7] via-50% to-[#5B4BFF] bg-[length:200%_auto] ${
        !disabled ? 'animate-shine' : ''
      } ${className}`}
      style={{
        animationDuration: `${speed}s`,
      }}
    >
      {text}
    </span>
  );
};

export default ShinyText;
