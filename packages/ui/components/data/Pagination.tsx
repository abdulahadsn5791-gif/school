import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { IconButton } from '../controls/Button';

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  const canPrev = page > 1;
  const canNext = page < pageCount;
  const prevPage = Math.min(page - 1, pageCount);
  const nextPage = Math.min(page + 1, pageCount);

  const pages: number[] = [];
  for (let i = Math.max(1, page - 1); i <= Math.min(pageCount, page + 1); i++) {
    pages.push(i);
  }

  return (
    <nav aria-label="Pagination" className={cn('flex items-center gap-1', className)}>
      <IconButton label="Previous page" disabled={!canPrev} onClick={() => onPageChange(prevPage)}>
        <ChevronLeft className="size-4" />
      </IconButton>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onPageChange(p)}
          className={cn(
            'flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm transition-all duration-200 ease-spring',
            p === page
              ? 'bg-accent font-semibold text-accent-ink'
              : 'text-ink-3 hover:bg-surface-3 hover:text-ink',
          )}
        >
          <span className="font-mono tabular-nums">{p}</span>
        </button>
      ))}
      <IconButton label="Next page" disabled={!canNext} onClick={() => onPageChange(nextPage)}>
        <ChevronRight className="size-4" />
      </IconButton>
    </nav>
  );
}
