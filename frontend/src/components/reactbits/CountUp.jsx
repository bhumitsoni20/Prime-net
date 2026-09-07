import { useEffect, useRef, useState } from 'react';

export const CountUp = ({
  to = 0,
  from = 0,
  duration = 2,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [value, setValue] = useState(from);
  const ref = useRef(null);

  useEffect(() => {
    let startTimestamp = null;
    const startValue = from;
    const endValue = Number(to) || 0;

    let frameId;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(easeProgress * (endValue - startValue) + startValue);
      setValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [to, from, duration]);

  const formatted = value.toLocaleString();

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export default CountUp;
