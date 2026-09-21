import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from '../../utils/cn';

export type InputProps = React.ComponentProps<'input'>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <InputPrimitive
        type={type}
        data-slot="input"
        className={cn(
          'h-10 w-full min-w-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white transition-all duration-150 ease-out outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 shadow-2xs dark:bg-slate-800/80',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
