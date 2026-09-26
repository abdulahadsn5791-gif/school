'use client';

import {
  useApproveLeave,
  useGetLeaves,
  useRejectLeave,
  useSoftDeleteLeave,
} from '@ecomerece/frontend';
import type { GetLeavesType, LeaveResponseDto } from '@ecomerece/shared';
import { Badge, Button, Field, Modal, Select, Textarea } from '@ecomerece/ui';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';

const PAGE_SIZE = 20;

const STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
type LeaveStatus = (typeof STATUSES)[number];

export default function AdminLeavesPage() {
  const [status, setStatus] = useState<LeaveStatus | ''>('PENDING');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [reviewing, setReviewing] = useState<{
    leave: LeaveResponseDto;
    action: 'approve' | 'reject';
  } | null>(null);
  const [deleting, setDeleting] = useState<LeaveResponseDto | null>(null);

  const params: GetLeavesType = {
    status: status || undefined,
    cursor,
    limit: PAGE_SIZE,
    direction: 'next',
  };
  const list = useGetLeaves(params);
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();
  const softDeleteLeave = useSoftDeleteLeave();

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? null;
  const busy = approveLeave.isPending || rejectLeave.isPending || softDeleteLeave.isPending;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Leave requests</h1>
          <p className="mt-1 text-sm text-ink-3">
            Approve or reject pending requests. Reviewer and remark are recorded.
          </p>
        </div>
      </header>

      <div className="mt-4 sm:w-44">
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as LeaveStatus | '');
            setCursor(undefined);
          }}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
        <div className="overflow-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-line/10">
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Applicant</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Role</th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 md:table-cell">
                  Dates
                </th>
                <th className="hidden max-w-64 truncate px-3 py-2 text-xs font-medium text-ink-3 lg:table-cell">
                  Reason
                </th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Status</th>
                <th className="px-3 py-2" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line/5">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-ink-3">
                    {list.isLoading ? 'Loading…' : 'No leave requests'}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-3">
                  <td className="max-w-36 truncate px-3 py-2 font-mono text-xs text-ink-2">
                    {row.applicantId}
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone="neutral">{row.applicantRole}</Badge>
                  </td>
                  <td className="hidden px-3 py-2 text-sm text-ink-2 md:table-cell">
                    {new Date(row.fromDate).toLocaleDateString()} –{' '}
                    {new Date(row.toDate).toLocaleDateString()}
                  </td>
                  <td className="hidden max-w-64 truncate px-3 py-2 text-sm text-ink-2 lg:table-cell">
                    {row.reason}
                  </td>
                  <td className="px-3 py-2">
                    <Badge
                      tone={
                        row.status === 'APPROVED'
                          ? 'success'
                          : row.status === 'REJECTED'
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      {row.status === 'PENDING' && !row.isDeleted && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() => setReviewing({ leave: row, action: 'approve' })}
                          >
                            <Check className="size-4" /> Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() => setReviewing({ leave: row, action: 'reject' })}
                          >
                            <X className="size-4" /> Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={busy}
                        onClick={() => setDeleting(row)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {list.isError && <p className="mt-3 text-sm text-danger">{(list.error as Error)?.message}</p>}

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!meta?.prevCursor}
          onClick={() => setCursor(meta?.prevCursor ?? undefined)}
        >
          <ChevronLeft className="size-4" /> Prev
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!meta?.hasMore}
          onClick={() => setCursor(meta?.nextCursor ?? undefined)}
        >
          Next <ChevronRight className="size-4" />
        </Button>
      </div>

      <Modal
        open={reviewing !== null}
        onClose={() => setReviewing(null)}
        title={reviewing?.action === 'approve' ? 'Approve leave' : 'Reject leave'}
      >
        {reviewing && (
          <ReviewForm
            key={`${reviewing.leave.id}-${reviewing.action}`}
            leaveId={reviewing.leave.id}
            action={reviewing.action}
            onDone={() => setReviewing(null)}
          />
        )}
      </Modal>

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete leave request?"
      >
        <p className="text-sm text-ink-2">
          {deleting
            ? `Request from ${deleting.applicantId.slice(0, 8)}… will be soft-deleted.`
            : ''}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={softDeleteLeave.isPending}
            onClick={() => {
              if (!deleting) return;
              softDeleteLeave.mutate(
                { leaveId: deleting.id, reason: 'Deleted from admin console' },
                { onSuccess: () => setDeleting(null) },
              );
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function ReviewForm({
  leaveId,
  action,
  onDone,
}: {
  leaveId: string;
  action: 'approve' | 'reject';
  onDone: () => void;
}) {
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();
  const [remark, setRemark] = useState('');
  const pending = approveLeave.isPending || rejectLeave.isPending;
  const error = approveLeave.error ?? rejectLeave.error;

  const submit = () => {
    const mutation = action === 'approve' ? approveLeave : rejectLeave;
    mutation.mutate({ leaveId, remark: remark || null }, { onSuccess: onDone });
  };

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Field label="Remark" hint="Optional, recorded with the review">
        <Textarea value={remark} onChange={(e) => setRemark(e.target.value)} rows={3} />
      </Field>
      {error && <p className="text-sm text-danger">{error.message}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button
          variant={action === 'approve' ? 'primary' : 'destructive'}
          type="submit"
          isLoading={pending}
        >
          {action === 'approve' ? 'Approve' : 'Reject'}
        </Button>
      </div>
    </form>
  );
}
