import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type BannerTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BannerProps {
  title: ReactNode;
  description?: ReactNode;
  tone?: BannerTone;
  action?: ReactNode;
  className?: string;
}

const toneBorders = {
  success: 'bg-success/10',
  warning: 'bg-warning/10',
  danger: 'bg-danger/10',
  info: 'bg-info/10',
  neutral: 'bg-surface-3',
} as const;

const toneDots = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-line/30',
} as const;

export function Banner({ title, description, tone = 'neutral', action, className }: BannerProps) {
  return (
    <div
      role="status"
      className={cn('flex items-start gap-3 rounded-2xl p-4', toneBorders[tone], className)}
    >
      <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', toneDots[tone])} />
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="mt-0.5 text-sm text-ink-2">{description}</p>}
      </div>
      {action && <div className="ml-auto shrink-0">{action}</div>}
    </div>
  );
}
