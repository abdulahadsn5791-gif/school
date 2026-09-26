'use client';

import { useGetLeaves, useSubmitLeave, useTeacherContext } from '@ecomerece/frontend';
import type { LeaveStatus } from '@ecomerece/shared';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Select,
  Spinner,
  Textarea,
} from '@ecomerece/ui';
import { CalendarPlus, FileText } from 'lucide-react';
import { useState } from 'react';

const PAGE_SIZE = 20;
const MIN_REASON = 10;

const STATUS_TONE: Record<LeaveStatus, 'warning' | 'success' | 'danger'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};

function todayIso(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function dayCount(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
}

export default function TeacherLeavesPage() {
  const { classes, hasClasses, isLoading: classesLoading, schoolId } = useTeacherContext();

  if (classesLoading && !hasClasses) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Card padding="lg" className="flex items-center gap-3">
          <Spinner />
          <span className="text-sm text-ink-3">Loading…</span>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Leaves</h1>
        <p className="mt-1 text-sm text-ink-3">
          Request time off and track where each application stands.
        </p>
      </header>

      <RequestLeave
        schoolId={schoolId}
        classOptions={classes.map((c) => ({ id: c.id, name: c.name }))}
      />
      <MyLeaves schoolId={schoolId} />
    </div>
  );
}

function RequestLeave({
  schoolId,
  classOptions,
}: {
  schoolId: string | undefined;
  classOptions: Array<{ id: string; name: string }>;
}) {
  const submitLeave = useSubmitLeave();

  const [fromDate, setFromDate] = useState(todayIso);
  const [toDate, setToDate] = useState(todayIso);
  const [reason, setReason] = useState('');
  const [classId, setClassId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const reasonLength = reason.trim().length;
  const datesOrdered = toDate >= fromDate;
  const isValid = Boolean(schoolId) && datesOrdered && reasonLength >= MIN_REASON;

  const submit = () => {
    setFormError(null);
    if (!schoolId) {
      setFormError('A school could not be resolved, so the request cannot be filed.');
      return;
    }
    if (!datesOrdered) {
      setFormError('The end date cannot be before the start date.');
      return;
    }
    if (reasonLength < MIN_REASON) {
      setFormError(`Give a reason of at least ${MIN_REASON} characters.`);
      return;
    }
    submitLeave.mutate(
      {
        schoolId,
        // A teacher always files as a teacher; the API rejects any mismatch.
        applicantRole: 'teacher',
        classId: classId ? classId : null,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          setReason('');
          setFromDate(todayIso());
          setToDate(todayIso());
        },
      },
    );
  };

  return (
    <Card
      padding="lg"
      className="mt-6"
      title="Request leave"
      description="Filed under your own account. An administrator approves or rejects it."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="From" htmlFor="leave-from">
          <Input
            id="leave-from"
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              // Keep the range valid as the start moves past the current end.
              if (toDate < e.target.value) setToDate(e.target.value);
            }}
          />
        </Field>

        <Field
          label="To"
          htmlFor="leave-to"
          error={datesOrdered ? undefined : 'End date is before the start date.'}
        >
          <Input
            id="leave-to"
            type="date"
            min={fromDate}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </Field>

        <Field
          label="Reason"
          htmlFor="leave-reason"
          className="sm:col-span-2"
          hint={`${reasonLength}/${MIN_REASON} minimum characters`}
        >
          <Textarea
            id="leave-reason"
            rows={3}
            maxLength={500}
            value={reason}
            placeholder="Briefly explain the reason for your leave"
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>

        {classOptions.length > 0 && (
          <Field
            label="Class (optional)"
            htmlFor="leave-class"
            hint="Only if this leave affects one of your classes"
            className="sm:col-span-2"
          >
            <Select id="leave-class" value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">No specific class</option>
              {classOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button
          variant="primary"
          isLoading={submitLeave.isPending}
          disabled={!isValid}
          onClick={submit}
        >
          <CalendarPlus className="size-4" /> Submit request
        </Button>
        {submitLeave.isSuccess && !submitLeave.isPending && (
          <span className="text-sm text-ink-3">Request submitted.</span>
        )}
      </div>

      {(formError || submitLeave.error) && (
        <p className="mt-3 text-sm text-danger">
          {formError ?? (submitLeave.error as Error).message}
        </p>
      )}
    </Card>
  );
}

function MyLeaves({ schoolId }: { schoolId: string | undefined }) {
  const [status, setStatus] = useState<LeaveStatus | ''>('');
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const list = useGetLeaves(
    { schoolId, status: status || undefined, cursor, limit: PAGE_SIZE, direction: 'next' },
    { enabled: Boolean(schoolId) },
  );

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? null;

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">Your applications</h2>
        <div className="w-44">
          <Select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as LeaveStatus | '');
              setCursor(undefined);
            }}
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </Select>
        </div>
      </div>

      {rows.length === 0 && !list.isLoading ? (
        <div className="mt-4">
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Anything you submit above will appear here with its current status."
          />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((leave) => {
            const from = new Date(leave.fromDate);
            const to = new Date(leave.toDate);
            return (
              <Card key={leave.id} padding="lg">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-ink">
                        {from.toLocaleDateString()} – {to.toLocaleDateString()}
                      </p>
                      <Badge tone={STATUS_TONE[leave.status]}>{leave.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink-3">
                      {dayCount(from, to)} {dayCount(from, to) === 1 ? 'day' : 'days'} · filed{' '}
                      {new Date(leave.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-ink-2">{leave.reason}</p>
                    {leave.reviewRemark && (
                      <p className="mt-2 rounded-2xl bg-surface-2 px-3 py-2 text-sm text-ink-2">
                        <span className="font-medium text-ink">Reviewer: </span>
                        {leave.reviewRemark}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {list.isError && <p className="mt-3 text-sm text-danger">{(list.error as Error)?.message}</p>}

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!cursor}
          onClick={() => setCursor(meta?.prevCursor ?? undefined)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!meta?.hasMore}
          onClick={() => setCursor(meta?.nextCursor ?? undefined)}
        >
          Next
        </Button>
      </div>
    </>
  );
}
