import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type SortDirection = 'asc' | 'desc';

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  sortKey?: string;
  /**
   * Extra columns revealed only as viewport allows (DESIGN.md §18.5).
   */
  show?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  headerClassName?: string;
  cellClassName?: string;
}

export interface TableProps<T> {
  columns: Array<TableColumn<T>>;
  rows: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  sort?: { key: string; direction: SortDirection };
  onSort?: (key: string, direction: SortDirection) => void;
  density?: 'comfortable' | 'dense' | 'compact';
  maxHeight?: number;
  emptyText?: string;
  className?: string;
}

const showClasses = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
  '2xl': 'hidden 2xl:table-cell',
  '3xl': 'hidden 3xl:table-cell',
  '4xl': 'hidden 4xl:table-cell',
} as const;

const densityClasses = {
  comfortable: 'px-5 py-4',
  dense: 'px-3 py-2',
  compact: 'px-2.5 py-1.5',
} as const;

function SortIndicator({ active, direction }: { active: boolean; direction?: SortDirection }) {
  if (!active) return <ChevronsUpDown className="size-3 text-ink-3" />;
  return direction === 'asc' ? (
    <ArrowUp className="size-3 text-ink" />
  ) : (
    <ArrowDown className="size-3 text-ink" />
  );
}

function SortButton({
  active,
  direction,
  onToggle,
  children,
  className,
}: {
  active: boolean;
  direction?: SortDirection;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-1 text-left text-xs font-medium transition-colors duration-200 ease-spring',
        active ? 'text-ink' : 'text-ink-3 hover:text-ink',
        className,
      )}
    >
      {children}
      <SortIndicator active={active} direction={direction} />
    </button>
  );
}

export function Table<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  sort,
  onSort,
  density = 'dense',
  maxHeight,
  emptyText = 'No results',
  className,
}: TableProps<T>) {
  return (
    <div className={cn('overflow-hidden rounded-2xl bg-surface-2 shadow-sm', className)}>
      <div className="overflow-auto" style={maxHeight ? { maxHeight } : undefined}>
        <table className="w-full min-w-[640px] text-left">
          <thead className="sticky top-0 z-raised bg-surface-2">
            <tr className="border-b border-line/10">
              {columns.map((column) => {
                const active = sort?.key === column.sortKey;
                const Th = (
                  <th
                    key={column.key}
                    className={cn(
                      'whitespace-nowrap font-medium',
                      densityClasses[density],
                      column.align === 'right'
                        ? 'text-right'
                        : column.align === 'center'
                          ? 'text-center'
                          : 'text-left',
                      column.show && showClasses[column.show],
                      column.headerClassName,
                    )}
                  >
                    {column.sortKey && onSort ? (
                      <SortButton
                        active={active}
                        direction={sort?.direction}
                        onToggle={() =>
                          onSort(
                            column.sortKey as string,
                            active && sort?.direction === 'asc' ? 'desc' : 'asc',
                          )
                        }
                      >
                        {column.header}
                      </SortButton>
                    ) : (
                      column.header
                    )}
                  </th>
                );
                return Th;
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/5">
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className={cn('text-center text-sm text-ink-3', densityClasses.dense)}
                >
                  {emptyText}
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const key = rowKey(row);
              return (
                <tr
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'transition-colors duration-150',
                    onRowClick ? 'cursor-pointer hover:bg-surface-3' : '',
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'text-sm',
                        densityClasses[density],
                        column.align === 'right'
                          ? 'font-mono tabular-nums text-right text-ink-2'
                          : column.align === 'center'
                            ? 'text-center'
                            : 'text-left',
                        column.show && showClasses[column.show],
                        column.cellClassName,
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
