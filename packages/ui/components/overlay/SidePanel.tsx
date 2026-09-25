import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Portal } from '../../lib/Portal';
import { useOverlay } from '../../lib/useOverlay';
import { IconButton } from '../controls/Button';

export interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  side?: 'left' | 'right';
  widthClass?: string;
  closeButtonLabel?: string;
}

export function SidePanel({
  open,
  onClose,
  title,
  description,
  children,
  className,
  side = 'right',
  widthClass = 'w-full max-w-md',
  closeButtonLabel = 'Close',
}: SidePanelProps) {
  const { containerRef } = useOverlay({ open, onClose });
  const hidden = side === 'right' ? 'translate-x-full' : '-translate-x-full';
  const revealed = side === 'right' ? 'translate-x-0' : 'translate-x-0';

  return (
    <Portal>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: decorative backdrop; Escape handled by useOverlay */}
      <div
        role="presentation"
        onClick={onClose}
        data-open={open}
        className={cn(
          'fixed inset-0 z-modal bg-black/50',
          'opacity-0 pointer-events-none transition-opacity duration-200 ease-spring',
          'data-[open=true]:opacity-100 data-[open=true]:pointer-events-auto',
        )}
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        inert={!open || undefined}
        aria-label={typeof title === 'string' ? title : undefined}
        data-open={open}
        className={cn(
          'fixed inset-y-0 z-modal flex flex-col bg-surface-4 shadow-lg',
          'glass:glass-surface',
          side === 'right' ? 'right-0' : 'left-0',
          widthClass,
          hidden,
          `transition-transform duration-slow ease-spring data-[open=true]:${revealed}`,
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 p-5 pb-0">
          <div className="min-w-0">
            {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
            {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
          </div>
          <IconButton label={closeButtonLabel} onClick={onClose} className="-m-2 h-9 w-9">
            <X className="size-4" />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </Portal>
  );
}
