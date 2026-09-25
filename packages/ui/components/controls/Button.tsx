import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full text-sm transition-all duration-200 ease-spring active:scale-[0.97] disabled:pointer-events-none';

const variants = {
  primary: cn(
    'bg-accent font-semibold text-accent-ink shadow-sm hover:brightness-105',
    'disabled:bg-surface-3 disabled:text-ink-4 disabled:shadow-none',
  ),
  secondary: cn(
    'bg-surface-3 font-medium text-ink hover:bg-surface-4',
    'disabled:text-ink-4 disabled:shadow-none',
  ),
  ghost: cn('font-medium text-ink-2 hover:bg-surface-3 hover:text-ink', 'disabled:text-ink-4'),
  danger: cn('font-semibold text-danger hover:bg-danger/10', 'disabled:text-ink-4'),
  destructive: cn(
    'bg-danger font-semibold text-accent-ink shadow-sm hover:brightness-105',
    'disabled:bg-surface-3 disabled:text-ink-4 disabled:shadow-none',
  ),
} as const;

const sizes = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
  icon: 'h-11 w-11 p-0',
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
  loadingText?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  loadingText,
  fullWidth = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        focusRing(),
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 shrink-0 animate-spin" />
          <span>{(loadingText ?? children) !== null && (loadingText ?? children)}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function IconButton({ label, className, children, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-2',
        'transition-all duration-200 ease-spring hover:bg-surface-3 hover:text-ink active:scale-[0.97]',
        focusRing(),
        'disabled:pointer-events-none disabled:text-ink-4',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
