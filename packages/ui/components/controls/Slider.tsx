import { type CSSProperties, type InputHTMLAttributes, useCallback, useId } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onValueChange: (value: number) => void;
  label?: string;
  showValue?: boolean;
}

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  onValueChange,
  label,
  showValue = false,
  disabled,
  className,
  id,
  ...rest
}: SliderProps) {
  const autoId = useId();
  const sliderId = id ?? autoId;

  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange(Number(e.target.value));
    },
    [onValueChange],
  );

  const thumbStyle = {
    left: `${percent}%`,
    transform: percent <= 0 ? 'translateX(0)' : 'translateX(-50%)',
  } as CSSProperties;

  return (
    <div className={cn('w-full', disabled && 'opacity-50', className)}>
      {(label || showValue) && (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          {label && <span className="text-sm font-medium">{label}</span>}
          {showValue && (
            <span className="ml-auto font-mono tabular-nums text-xs text-ink-3">{value}</span>
          )}
        </div>
      )}
      <div className="relative h-6">
        {/* track */}
        <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-surface-3">
          <span
            aria-hidden="true"
            className="block h-full rounded-full bg-accent transition-[width] duration-200 ease-spring"
            style={{ width: `${percent}%` }}
          />
        </span>
        {/* thumb */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-surface-4 shadow-md transition-transform duration-200 ease-spring"
          style={thumbStyle}
        />
        {/* invisible native input captures pointer + keyboard */}
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={label}
          aria-valuetext={showValue ? String(value) : undefined}
          onChange={handleChange}
          className={cn(
            'absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent',
            // strip native chrome; the styled track/thumb below carry the visuals
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6',
            '[&::-webkit-slider-thumb]:bg-transparent [&::-moz-range-thumb]:size-6',
            '[&::-moz-range-thumb]:bg-transparent [&::-moz-range-thumb]:border-0',
            '[&::-webkit-slider-runnable-track]:bg-transparent',
            '[&::-moz-range-track]:bg-transparent',
            focusRing(),
          )}
          {...rest}
        />
      </div>
    </div>
  );
}
