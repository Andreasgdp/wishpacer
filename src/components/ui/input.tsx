import * as React from 'react';
import { cn } from '../../utils/cn';

export type InputProps = React.ComponentProps<'input'>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onChange, onInput, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          'h-10 w-full min-w-0 rounded-xl border border-black/10 dark:border-[#21262D] bg-white/90 dark:bg-[#0D1117] backdrop-blur-sm px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white transition-all duration-150 ease-out outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 shadow-2xs',
          className
        )}
        ref={ref}
        onChange={onChange}
        onInput={onInput || (onChange as unknown as React.FormEventHandler<HTMLInputElement>)}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
