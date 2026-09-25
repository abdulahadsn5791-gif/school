import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface TabItem<T extends string = string> {
  label: ReactNode;
  value: T;
  disabled?: boolean;
}

export interface TabsProps<T extends string = string> {
  items: Array<TabItem<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Tabs<T extends string = string>({
  items,
  value,
  onChange,
  className,
}: TabsProps<T>) {
  return (
    <div role="tablist" aria-label="Tabs" className={cn('flex gap-1.5', className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-spring',
              active
                ? 'bg-surface-3 text-ink'
                : 'text-ink-2 hover:bg-surface-2 hover:text-ink disabled:text-ink-4',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
