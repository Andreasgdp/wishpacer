import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

const alertVariants = cva(
  'relative w-full rounded-2xl border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-slate-950 dark:[&>svg]:text-slate-50',
  {
    variants: {
      variant: {
        default:
          'bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 border-slate-200 dark:border-slate-800',
        destructive:
          'border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 [&>svg]:text-rose-600 dark:[&>svg]:text-rose-400',
        success:
          'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400',
        info: 'border-sky-200 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/20 text-sky-900 dark:text-sky-200 [&>svg]:text-sky-600 dark:[&>svg]:text-sky-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, children, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
    {variant === 'destructive' && <XCircle className="h-4 w-4" />}
    {variant === 'success' && <CheckCircle2 className="h-4 w-4" />}
    {variant === 'info' && <Info className="h-4 w-4" />}
    {variant === 'default' && <AlertCircle className="h-4 w-4" />}
    {children}
  </div>
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn('mb-1 font-bold leading-none tracking-tight text-xs sm:text-sm', className)}
      {...props}
    />
  )
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-xs opacity-90 [&_p]:leading-relaxed', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
