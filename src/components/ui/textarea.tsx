import * as React from 'react';
import { cn } from '../../utils/cn';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        data-slot="textarea"
        className={cn(
          'flex min-h-[80px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white transition-all duration-150 ease-out outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 shadow-2xs resize-none dark:bg-slate-800/80',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
