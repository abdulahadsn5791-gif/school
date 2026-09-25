import type { CSSProperties } from 'react';
import { cn } from '../../lib/cn';

export interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
}

const toneClasses = {
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
} as const;

export function Progress({ value, max = 100, className, tone = 'accent' }: ProgressProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-3', className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-slow ease-spring',
          toneClasses[tone],
        )}
        style={{ width: `${percent}%` } as CSSProperties}
      />
    </div>
  );
}

export interface SegmentedMeterSegment {
  value: number;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
  className?: string;
  label?: string;
}

export interface SegmentedMeterProps {
  segments: SegmentedMeterSegment[];
  total?: number;
  className?: string;
}

export function SegmentedMeter({ segments, total, className }: SegmentedMeterProps) {
  const sum = total ?? segments.reduce((acc, segment) => acc + segment.value, 0);
  const safeSum = Math.max(sum, 1);

  return (
    <div
      role="img"
      aria-label="Segmented meter"
      className={cn('flex h-2 overflow-hidden rounded-full bg-surface-3', className)}
    >
      {segments.map((segment, index) => {
        const width = Math.max(0, (segment.value / safeSum) * 100);
        if (width <= 0) return null;
        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: static meter segments, no stable identity
            key={index}
            title={segment.label}
            className={cn(
              'h-full',
              segment.tone ? toneClasses[segment.tone] : 'bg-line/15',
              segment.className,
            )}
            style={{ width: `${width}%` }}
          />
        );
      })}
    </div>
  );
}
