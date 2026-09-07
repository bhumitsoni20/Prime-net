import { memo } from 'react';

export const DotGridBackground = memo(({
  dotColor = '#CBD5E1',
  spacing = 28,
  dotRadius = 1.25,
  opacity = 0.3,
  className = '',
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="streamkart-dot-pattern"
            x="0"
            y="0"
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={spacing / 2} cy={spacing / 2} r={dotRadius} fill={dotColor} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#streamkart-dot-pattern)" />
      </svg>
    </div>
  );
});

DotGridBackground.displayName = 'DotGridBackground';

export default DotGridBackground;
