import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

export const AuroraBackground = ({
  className = '',
  children,
  showRadialGradient = true,
  showGrid = true,
  ...props
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex flex-col items-center justify-center overflow-hidden bg-[#FAFBFF] transition-bg ${className}`}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        
        {/* Subtle Modern Tech Grid Lattice */}
        {showGrid && (
          <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(91,75,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(91,75,255,0.04)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_75%_55%_at_50%_35%,#000_50%,transparent_100%)]" />
        )}

        {/* Interactive Smooth Cursor Spotlight Glow */}
        {isHovered && (
          <div
            className="absolute w-[450px] h-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#5B4BFF]/15 to-[#A855F7]/15 blur-[90px] transition-opacity duration-500 pointer-events-none"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
            }}
          />
        )}

        {/* Animated Aurora Mesh */}
        <div
          className={`
            [--white-gradient:repeating-linear-gradient(100deg,var(--color-card)_0%,var(--color-card)_7%,transparent_10%,transparent_12%,var(--color-card)_16%)]
            [--aurora:repeating-linear-gradient(100deg,#5B4BFF_10%,#8B5CF6_15%,#A855F7_20%,#38BDF8_25%,#6366F1_30%)]
            [background-image:var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[70px] sm:blur-[100px]
            opacity-30 sm:opacity-35
            will-change-transform
            absolute -inset-[10px]
            animate-aurora
          `}
        />

        {/* Ambient floating light orbs */}
        <motion.div
          animate={{
            x: [-20, 30, -20],
            y: [-30, 20, -30],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-[15%] -left-[10%] w-[450px] sm:w-[600px] h-[450px] sm:h-[600px] rounded-full bg-gradient-to-br from-[#5B4BFF]/20 via-[#7C3AED]/15 to-transparent blur-[90px]"
        />

        <motion.div
          animate={{
            x: [30, -20, 30],
            y: [20, -30, 20],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute -bottom-[15%] -right-[10%] w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] rounded-full bg-gradient-to-tl from-[#A855F7]/20 via-[#38BDF8]/15 to-transparent blur-[95px]"
        />

        {showRadialGradient && (
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_30%,#FAFBFF_85%)]" />
        )}
      </div>

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};

export default AuroraBackground;
