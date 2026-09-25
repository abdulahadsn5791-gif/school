import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export interface SegmentedOption<T extends string | number = string> {
  label: ReactNode;
  value: T;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string | number = string> {
  options: Array<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
  'aria-label'?: string;
}

export function SegmentedControl<T extends string | number = string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
  'aria-label': ariaLabel = 'Segmented control',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('inline-flex rounded-full bg-surface-3 p-1', className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={String(option.value)}
            role="tab"
            type="button"
            aria-selected={selected}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-full font-medium transition-all duration-200 ease-spring',
              size === 'md' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs',
              selected
                ? 'bg-surface-4 text-ink shadow-sm'
                : 'text-ink-2 hover:text-ink disabled:text-ink-4',
              focusRing(),
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
