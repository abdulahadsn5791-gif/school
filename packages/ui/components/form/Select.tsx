import { ChevronDown } from 'lucide-react';
import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, className, disabled, children, ...rest },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(
          'w-full appearance-none rounded-full bg-surface-3 px-4 py-2.5 pr-10 text-sm text-ink',
          'focus:outline-none transition-all duration-200 ease-spring',
          'focus:ring-2 focus:ring-accent',
          invalid && 'ring-2 ring-danger',
          'disabled:cursor-not-allowed disabled:text-ink-4 disabled:opacity-60',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        className={cn(
          'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4',
          disabled ? 'text-ink-4' : 'text-ink-3',
        )}
        aria-hidden="true"
      />
    </div>
  );
});
