import React, { useId } from 'react';

export interface LogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  badge?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  badge,
  onClick,
}) => {
  const uid = useId().replace(/:/g, '');

  // Size dimensions for icon and text
  const sizeMap = {
    sm: {
      box: 'w-7 h-7',
      svgSize: 28,
      textSize: 'text-sm font-bold',
      gap: 'gap-2',
      badgeSize: 'text-[9px] px-1.5 py-0.5',
    },
    md: {
      box: 'w-9 h-9',
      svgSize: 36,
      textSize: 'text-lg font-extrabold',
      gap: 'gap-2.5',
      badgeSize: 'text-[10px] px-2 py-0.5',
    },
    lg: {
      box: 'w-11 h-11',
      svgSize: 44,
      textSize: 'text-2xl font-extrabold',
      gap: 'gap-3',
      badgeSize: 'text-xs px-2.5 py-0.5',
    },
    xl: {
      box: 'w-14 h-14',
      svgSize: 56,
      textSize: 'text-3xl font-black',
      gap: 'gap-3.5',
      badgeSize: 'text-xs px-3 py-1',
    },
  };

  const { box, svgSize, textSize, gap, badgeSize } = sizeMap[size] || sizeMap.md;

  const bgGradId = `logo-bg-${uid}`;
  const starGradId = `logo-star-${uid}`;
  const lineGradId = `logo-line-${uid}`;
  const glowId = `logo-glow-${uid}`;

  const iconSvg = (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-700 shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all duration-200 ${box}`}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        role="img"
        className="w-full h-full p-1"
      >
        <defs>
          <linearGradient id={bgGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id={starGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E0E7FF" />
          </linearGradient>
          <linearGradient id={lineGradId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Upward trendline / pace arc */}
        <path
          d="M 22 72 C 38 72, 46 58, 58 45 C 70 32, 75 27, 82 20"
          fill="none"
          stroke={`url(#${lineGradId})`}
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Speed dots along curve */}
        <circle cx="24" cy="72" r="3" fill="#C084FC" opacity="0.8" />
        <circle cx="42" cy="62" r="3.5" fill="#A855F7" />
        <circle cx="60" cy="42" r="4" fill="#818CF8" />

        {/* Primary Sparkle Wish Star at peak */}
        <g transform="translate(80, 18) scale(0.38)" filter={`url(#${glowId})`}>
          <path
            d="M 0 -36 C 4 -12, 12 -4, 36 0 C 12 4, 4 12, 0 36 C -4 12, -12 4, -36 0 C -12 -4, -4 -12, 0 -36 Z"
            fill={`url(#${starGradId})`}
          />
        </g>

        {/* Secondary Sparkle Star */}
        <g transform="translate(38, 38) scale(0.18)">
          <path
            d="M 0 -24 C 3 -8, 8 -3, 24 0 C 8 3, 3 8, 0 24 C -3 8, -8 3, -24 0 C -8 -3, -3 -8, 0 -24 Z"
            fill="#F472B6"
          />
        </g>
      </svg>
    </div>
  );

  if (variant === 'icon') {
    if (onClick) {
      return (
        <button
          type="button"
          onClick={onClick}
          aria-label="Wish Pacing"
          className={`inline-flex items-center cursor-pointer select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-xl ${className}`}
        >
          {iconSvg}
        </button>
      );
    }
    return (
      <div className={`inline-flex items-center select-none group ${className}`}>
        {iconSvg}
      </div>
    );
  }

  const content = (
    <>
      {iconSvg}
      <div className="hidden sm:flex items-center gap-2 min-w-0">
        <span className={`tracking-tight ${textSize} whitespace-nowrap`}>
          <span className="text-slate-900 dark:text-white">Wish</span>
          <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 dark:from-violet-400 dark:via-indigo-400 dark:to-blue-400 bg-clip-text text-transparent ml-1">
            Pacing
          </span>
        </span>
        {badge && (
          <span
            className={`inline-flex items-center font-bold tracking-wide uppercase rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200/80 dark:border-violet-800/80 shadow-2xs shrink-0 ${badgeSize}`}
          >
            {badge}
          </span>
        )}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Wish Pacing"
        className={`inline-flex items-center ${gap} select-none group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-xl ${className}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center ${gap} select-none group ${className}`}>
      {content}
    </div>
  );
};
