import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from './input';
import { cn } from '../../utils/cn';

export interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ className, value, onValueChange, placeholder = 'Search...', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-full w-full flex-col overflow-hidden rounded-2xl border border-black/10 dark:border-[#21262D] bg-white/95 dark:bg-[#12161A]/95 backdrop-blur-2xl text-slate-950 dark:text-slate-50',
          className
        )}
        {...props}
      >
        <div className="flex items-center border-b border-slate-200/80 dark:border-white/10 px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            value={value}
            onChange={e => onValueChange && onValueChange(e.target.value)}
            placeholder={placeholder}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 shadow-none"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">{children}</div>
      </div>
    );
  }
);
Command.displayName = 'Command';

export { Command };
