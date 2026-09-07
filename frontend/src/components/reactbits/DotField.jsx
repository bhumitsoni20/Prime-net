import { useEffect, useRef, memo } from 'react';
import './DotField.css';

const TWO_PI = Math.PI * 2;

const DotField = memo(({
  dotRadius = 2.5,
  dotSpacing = 22,
  cursorRadius = 350,
  cursorForce = 0.15,
  bulgeOnly = true,
  bulgeStrength = 60,
  glowRadius = 180,
  sparkle = false,
  waveAmplitude = 0,
  gradientFrom = 'rgba(91, 75, 255, 0.42)',
  gradientTo = 'rgba(124, 58, 237, 0.3)',
  glowColor = '#5B4BFF',
  className = '',
  style,
  children,
  ...rest
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const glowRef = useRef(null);
  const dotsRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0, active: false });
  const rafRef = useRef(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const glowOpacity = useRef(0);
  const engagement = useRef(0);
  const propsRef = useRef({});
  propsRef.current = { dotRadius, dotSpacing, cursorRadius, cursorForce, bulgeOnly, bulgeStrength, sparkle, waveAmplitude, gradientFrom, gradientTo, glowColor };
  const glowIdRef = useRef(`dot-field-glow-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const glowEl = glowRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let resizeTimer;

    function buildDots(w, h) {
      const p = propsRef.current;
      const step = p.dotRadius * 2 + p.dotSpacing;
      const cols = Math.floor(w / step);
      const rows = Math.floor(h / step);
      const padX = (w - (cols - 1) * step) / 2;
      const padY = (h - (rows - 1) * step) / 2;
      const dots = new Array(rows * cols);
      let idx = 0;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ax = padX + col * step;
          const ay = padY + row * step;
          dots[idx++] = { ax, ay, sx: ax, sy: ay, vx: 0, vy: 0, x: ax, y: ay };
        }
      }
      dotsRef.current = dots;
    }

    function doResize() {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      const w = Math.round(rect.width || window.innerWidth);
      const h = Math.round(rect.height || 600);

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      sizeRef.current = { w, h };
      buildDots(w, h);
    }

    function resize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(doResize, 60);
    }

    function onMouseMove(e) {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    }

    function onMouseLeave() {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
      mouseRef.current.active = false;
    }

    function updateMouseSpeed() {
      const m = mouseRef.current;
      if (!m.active || m.x < -1000) {
        m.speed *= 0.85;
        if (m.speed < 0.001) m.speed = 0;
        return;
      }
      const dx = m.prevX - m.x;
      const dy = m.prevY - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      m.speed += (dist - m.speed) * 0.4;
      if (m.speed < 0.001) m.speed = 0;
      m.prevX = m.x;
      m.prevY = m.y;
    }

    const speedInterval = setInterval(updateMouseSpeed, 20);
    let frameCount = 0;

    function tick() {
      frameCount++;
      const dots = dotsRef.current;
      const m = mouseRef.current;
      const { w, h } = sizeRef.current;
      const p = propsRef.current;
      const len = dots.length;
      const t = frameCount * 0.02;

      const targetEngagement = m.active ? Math.min(0.3 + m.speed / 4, 1) : 0;
      engagement.current += (targetEngagement - engagement.current) * 0.08;
      if (engagement.current < 0.001) engagement.current = 0;
      const eng = engagement.current;

      glowOpacity.current += (eng * 0.45 - glowOpacity.current) * 0.08;

      if (glowEl) {
        if (m.x > -500 && m.y > -500 && m.active) {
          glowEl.setAttribute('cx', m.x.toString());
          glowEl.setAttribute('cy', m.y.toString());
          glowEl.style.opacity = glowOpacity.current.toString();
        } else {
          glowEl.style.opacity = '0';
        }
      }

      ctx.clearRect(0, 0, w, h);

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, p.gradientFrom);
      grad.addColorStop(1, p.gradientTo);
      ctx.fillStyle = grad;

      const cr = p.cursorRadius;
      const crSq = cr * cr;
      const rad = p.dotRadius;
      const isBulge = p.bulgeOnly;

      ctx.beginPath();

      for (let i = 0; i < len; i++) {
        const d = dots[i];
        if (!d) continue;

        const dx = m.x - d.ax;
        const dy = m.y - d.ay;
        const distSq = dx * dx + dy * dy;

        if (distSq < crSq && m.active && eng > 0.005) {
          const dist = Math.sqrt(distSq);
          if (isBulge) {
            const tDist = 1 - dist / cr;
            const push = tDist * tDist * p.bulgeStrength * Math.max(eng, 0.35);
            const angle = Math.atan2(dy, dx);
            d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.22;
            d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.22;
          } else {
            const angle = Math.atan2(dy, dx);
            const move = (500 / (dist + 10)) * (m.speed * p.cursorForce);
            d.vx += Math.cos(angle) * -move;
            d.vy += Math.sin(angle) * -move;
          }
        } else if (isBulge) {
          d.sx += (d.ax - d.sx) * 0.12;
          d.sy += (d.ay - d.sy) * 0.12;
        }

        if (!isBulge) {
          d.vx *= 0.9;
          d.vy *= 0.9;
          d.x = d.ax + d.vx;
          d.y = d.ay + d.vy;
          d.sx += (d.x - d.sx) * 0.1;
          d.sy += (d.y - d.sy) * 0.1;
        }

        let drawX = d.sx;
        let drawY = d.sy;
        if (p.waveAmplitude > 0) {
          drawY += Math.sin(d.ax * 0.03 + t) * p.waveAmplitude;
          drawX += Math.cos(d.ay * 0.03 + t * 0.7) * p.waveAmplitude * 0.5;
        }

        if (p.sparkle) {
          const hash = ((i * 2654435761) ^ (frameCount >> 3)) >>> 0;
          if ((hash % 100) < 3) {
            ctx.moveTo(drawX + rad * 1.5, drawY);
            ctx.arc(drawX, drawY, rad * 1.5, 0, TWO_PI);
          } else {
            ctx.moveTo(drawX + rad, drawY);
            ctx.arc(drawX, drawY, rad, 0, TWO_PI);
          }
        } else {
          ctx.moveTo(drawX + rad, drawY);
          ctx.arc(drawX, drawY, rad, 0, TWO_PI);
        }
      }

      ctx.fill();

      rafRef.current = requestAnimationFrame(tick);
    }

    doResize();
    window.addEventListener('resize', resize);
    container.addEventListener('mousemove', onMouseMove, { passive: true });
    container.addEventListener('mouseleave', onMouseLeave, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(speedInterval);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className={`dot-field-container relative w-full overflow-hidden ${className}`} style={style} {...rest}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <defs>
          <radialGradient id={glowIdRef.current}>
            <stop offset="0%" stopColor={glowColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle
          ref={glowRef}
          cx="-9999"
          cy="-9999"
          r={glowRadius}
          fill={`url(#${glowIdRef.current})`}
          style={{ opacity: 0, willChange: 'opacity', transition: 'opacity 0.2s ease' }}
        />
      </svg>
      {children && <div className="relative z-10 w-full">{children}</div>}
    </div>
  );
});

DotField.displayName = 'DotField';

export default DotField;
