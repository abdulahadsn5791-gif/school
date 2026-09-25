import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
  'aria-label': ariaLabel,
  ...rest
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'flex h-7 w-12 shrink-0 items-center rounded-full px-1 transition-all duration-200 ease-spring',
        checked ? 'justify-end bg-accent' : 'justify-start bg-line/15',
        disabled && 'pointer-events-none opacity-50',
        focusRing(),
        className,
      )}
      {...rest}
    >
      <span className="block h-5 w-5 rounded-full bg-white shadow-sm" />
    </button>
  );
}
