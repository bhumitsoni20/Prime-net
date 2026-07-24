const Card = ({ children, className = '', hover = true, ...props }) => {
  return (
    <div
      className={`bg-white border border-[#E2E8F0] rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${hover ? 'transition-all duration-300 hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.08)] hover:border-[#CBD5E1]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
