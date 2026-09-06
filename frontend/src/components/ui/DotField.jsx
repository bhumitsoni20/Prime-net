import { useEffect, useRef } from "react";

/**
 * React Bits DotField Component
 * High-performance HTML5 canvas dot matrix with cursor interaction (bulge/glow),
 * light/white theme optimization with defined purple dots, and reduced-motion support.
 */
const DotField = ({
  dotRadius = 1.4,
  dotSpacing = 18,
  cursorRadius = 280,
  cursorForce = 28,
  bulgeStrength = 28,
  bulgeOnly = false,
  glowRadius = 100,
  sparkle = false,
  waveAmplitude = 0,
  gradientFrom = "rgba(109, 40, 217, 0.42)", // Richer purple
  gradientTo = "rgba(91, 75, 255, 0.36)",   // StreamKart purple
  glowColor = "rgba(124, 58, 237, 0.5)",
  className = "",
}) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    let time = 0;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = mediaQuery.matches;

    const handleMediaChange = (e) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        draw();
      }
    };
    mediaQuery.addEventListener("change", handleMediaChange);

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      draw();
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000, active: false };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / dotSpacing) + 2;
      const rows = Math.ceil(height / dotSpacing) + 2;
      const mouse = mouseRef.current;
      const force = cursorForce || bulgeStrength;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          let x = i * dotSpacing;
          let y = j * dotSpacing;

          // Wave motion if enabled
          if (waveAmplitude > 0 && !prefersReducedMotion) {
            y += Math.sin(time * 0.002 + i * 0.2) * waveAmplitude;
          }

          // Cursor displacement (Bulge effect)
          let currentRadius = dotRadius;
          let alpha = 0.38;

          if (mouse.active && !prefersReducedMotion) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < cursorRadius && dist > 0) {
              const factor = (1 - dist / cursorRadius);
              const angle = Math.atan2(dy, dx);
              const push = factor * factor * force;

              x += Math.cos(angle) * push;
              y += Math.sin(angle) * push;

              if (!bulgeOnly) {
                currentRadius = dotRadius + factor * 1.2;
                alpha = Math.min(0.65, 0.38 + factor * 0.25);
              }
            }
          }

          ctx.beginPath();
          ctx.arc(x, y, currentRadius, 0, Math.PI * 2);

          // Subtle gradient interpolation across the canvas
          const colorInterpolation = i / cols;
          ctx.fillStyle = colorInterpolation < 0.5 ? gradientFrom : gradientTo;
          ctx.globalAlpha = alpha;
          ctx.fill();

          // Optional sparkle / glow highlight near cursor
          if (sparkle && mouse.active && !prefersReducedMotion) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < glowRadius) {
              ctx.beginPath();
              ctx.arc(x, y, currentRadius * 1.5, 0, Math.PI * 2);
              ctx.fillStyle = glowColor;
              ctx.globalAlpha = 0.5 * (1 - dist / glowRadius);
              ctx.fill();
            }
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      time++;
      draw();
      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    if (!prefersReducedMotion) {
      loop();
    } else {
      draw();
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      mediaQuery.removeEventListener("change", handleMediaChange);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    dotRadius,
    dotSpacing,
    cursorRadius,
    cursorForce,
    bulgeStrength,
    bulgeOnly,
    glowRadius,
    sparkle,
    waveAmplitude,
    gradientFrom,
    gradientTo,
    glowColor,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 block w-full h-full ${className}`}
    />
  );
};

export default DotField;
