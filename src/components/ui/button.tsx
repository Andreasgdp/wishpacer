import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs sm:text-sm font-semibold ring-offset-white transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-[#041A10]',
  {
    variants: {
      variant: {
        default:
          'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs active:scale-[0.99]',
        destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs active:bg-rose-800',
        warning: 'bg-amber-600 text-white hover:bg-amber-700 shadow-xs active:bg-amber-800',
        outline:
          'border border-black/10 dark:border-[#21262D] bg-white dark:bg-[#161B22] hover:bg-black/5 dark:hover:bg-[#22282E] text-slate-700 dark:text-slate-200 hover:border-black/20 dark:hover:border-[#30363D] shadow-xs',
        secondary:
          'bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/[0.1]',
        ghost:
          'hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white',
        link: 'text-emerald-600 dark:text-emerald-400 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9 p-0 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
