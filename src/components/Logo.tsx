import React from 'react';

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

  const iconSvg = (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 border border-champagne-300/30 dark:border-champagne-200/20 shadow-md shadow-brand-950/20 group-hover:shadow-brand-950/30 transition-all duration-200 ${box}`}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 642 582"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        role="img"
        className="w-full h-full p-1.5"
      >
        {/* Clipboard notepad background */}
        {/* Clipboard notepad background in Champagne with Emerald Ink border */}
        <rect
          width="444.585"
          height="543.261"
          x="11"
          y="11"
          fill="#F8E7C9"
          stroke="#064E3B"
          strokeWidth="24"
          rx="32"
        />

        {/* Checklist rows in Emerald Ink */}
        <rect width="234.481" height="38.307" x="149.135" y="71.362" fill="#064E3B" rx="19.153" />
        <rect width="234.481" height="38.307" x="149.135" y="167.71" fill="#064E3B" rx="19.153" />
        <rect width="234.481" height="38.307" x="149.135" y="264.058" fill="#064E3B" rx="19.153" />
        <rect width="234.481" height="38.307" x="149.135" y="360.405" fill="#064E3B" rx="19.153" />
        <rect width="234.481" height="38.307" x="149.135" y="456.753" fill="#064E3B" rx="19.153" />

        {/* Checklist bullet dots in Emerald Ink */}
        <circle cx="102.122" cy="90.516" r="19.153" fill="#064E3B" />
        <circle cx="102.122" cy="186.863" r="19.153" fill="#064E3B" />
        <circle cx="102.122" cy="283.211" r="19.153" fill="#064E3B" />
        <circle cx="102.122" cy="379.559" r="19.153" fill="#064E3B" />
        <circle cx="102.122" cy="475.906" r="19.153" fill="#064E3B" />
        {/* Wishing Plan Heart Emblem */}
        <path
          d="m503.978 434.26.025.025-29.349 29.349c-10.544 10.544-27.639 10.544-38.183 0l-29.349-29.349.047-.047-54.098-54.099-3.943-3.943c-28.308-28.309-28.308-74.206 0-102.515 28.309-28.309 74.205-28.309 102.514 0l3.942 3.943 3.943-3.943c28.309-28.309 74.205-28.309 102.514 0 28.308 28.309 28.308 74.206 0 102.515l-3.943 3.943-54.12 54.121Z"
          fill="#064E3B"
          stroke="#F8E7C9"
          strokeWidth="22"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    if (onClick) {
      return (
        <button
          type="button"
          onClick={onClick}
          aria-label="WishPacer"
          className={`inline-flex items-center cursor-pointer select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 dark:focus-visible:ring-champagne-300 rounded-xl ${className}`}
        >
          {iconSvg}
        </button>
      );
    }
    return (
      <div className={`inline-flex items-center select-none group ${className}`}>{iconSvg}</div>
    );
  }

  const content = (
    <>
      {iconSvg}
      <div className="hidden sm:flex items-center gap-2 min-w-0">
        <span className={`tracking-tight ${textSize} whitespace-nowrap`}>
          <span className="text-slate-900 dark:text-white">Wish</span>
          <span className="bg-gradient-to-r from-brand-700 via-emerald-600 to-brand-900 dark:from-emerald-400 dark:via-champagne-300 dark:to-champagne-200 bg-clip-text text-transparent">
            Pacer
          </span>
        </span>
        {badge && (
          <span
            className={`inline-flex items-center font-bold tracking-wide uppercase rounded-full bg-champagne-100 dark:bg-brand-950/90 text-brand-900 dark:text-champagne-200 border border-champagne-300/80 dark:border-brand-800/80 shadow-2xs shrink-0 ${badgeSize}`}
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
        aria-label="WishPacer"
        className={`inline-flex items-center ${gap} select-none group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 dark:focus-visible:ring-champagne-300 rounded-xl ${className}`}
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
