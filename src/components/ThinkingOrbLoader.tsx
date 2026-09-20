import React from 'react';
import { ThinkingOrb, type OrbState, type OrbSize } from 'thinking-orbs';

interface ThinkingOrbLoaderProps {
  state?: OrbState;
  size?: OrbSize;
  label?: string;
  dark?: boolean;
}

export const ThinkingOrbLoader: React.FC<ThinkingOrbLoaderProps> = ({
  state = 'searching',
  size = 64,
  label,
  dark = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 text-center">
      <ThinkingOrb state={state} size={size} theme={dark ? 'dark' : 'light'} />
      {label && (
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
};
