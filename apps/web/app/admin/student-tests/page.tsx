'use client';

import {
  useGetSubmissions,
  useGradeSubmission,
  useMarkMissed,
  useSoftDeleteSubmission,
} from '@ecomerece/frontend';
import type { GetStudentTestsType, StudentTestResponseDto } from '@ecomerece/shared';
import { Badge, Button, Field, Input, Modal, Select, Textarea } from '@ecomerece/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const PAGE_SIZE = 20;

const STATUSES = ['PENDING', 'SUBMITTED', 'GRADED', 'MISSED'] as const;
type SubmissionStatus = (typeof STATUSES)[number];

export default function AdminStudentTestsPage() {
  const [status, setStatus] = useState<SubmissionStatus | ''>('SUBMITTED');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [grading, setGrading] = useState<StudentTestResponseDto | null>(null);
  const [deleting, setDeleting] = useState<StudentTestResponseDto | null>(null);

  const params: GetStudentTestsType = {
    status: status || undefined,
    cursor,
    limit: PAGE_SIZE,
    direction: 'next',
  };
  const list = useGetSubmissions(params);
  const gradeSubmission = useGradeSubmission();
  const markMissed = useMarkMissed();
  const softDeleteSubmission = useSoftDeleteSubmission();

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? null;
  const busy = gradeSubmission.isPending || markMissed.isPending || softDeleteSubmission.isPending;

  const statusTone = (s: SubmissionStatus) =>
    s === 'GRADED'
      ? 'success'
      : s === 'MISSED'
        ? 'danger'
        : s === 'SUBMITTED'
          ? 'accent'
          : 'warning';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Student tests</h1>
          <p className="mt-1 text-sm text-ink-3">
            Grade SUBMITTED work, mark no-shows MISSED. Grading is permanent once done.
          </p>
        </div>
      </header>

      <div className="mt-4 sm:w-44">
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as SubmissionStatus | '');
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
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Student</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Assignment</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Status</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Marks</th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 md:table-cell">
                  Submitted
                </th>
                <th className="px-3 py-2" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line/5">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-ink-3">
                    {list.isLoading ? 'Loading…' : 'No submissions'}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-3">
                  <td className="max-w-36 truncate px-3 py-2 font-mono text-xs text-ink-2">
                    {row.studentId}
                  </td>
                  <td className="max-w-36 truncate px-3 py-2 font-mono text-xs text-ink-2">
                    {row.assignmentId}
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                  </td>
                  <td className="px-3 py-2 font-mono text-sm text-ink-2">
                    {row.marksObtained ?? '—'}
                  </td>
                  <td className="hidden px-3 py-2 text-sm text-ink-2 md:table-cell">
                    {row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      {row.status === 'SUBMITTED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy}
                          onClick={() => setGrading(row)}
                        >
                          Grade
                        </Button>
                      )}
                      {row.status === 'PENDING' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy}
                          onClick={() => markMissed.mutate({ studentTestId: row.id })}
                        >
                          Mark missed
                        </Button>
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

      <Modal open={grading !== null} onClose={() => setGrading(null)} title="Grade submission">
        {grading && (
          <GradeForm
            key={grading.id}
            maxMarksHint={grading.marksObtained === null ? 'Marks >= 0' : undefined}
            studentTestId={grading.id}
            onDone={() => setGrading(null)}
          />
        )}
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Delete submission?">
        <p className="text-sm text-ink-2">
          {deleting ? `Submission ${deleting.id.slice(0, 8)}… will be soft-deleted.` : ''}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={softDeleteSubmission.isPending}
            onClick={() => {
              if (!deleting) return;
              softDeleteSubmission.mutate(
                { studentTestId: deleting.id, reason: 'Deleted from admin console' },
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

function GradeForm({
  studentTestId,
  maxMarksHint,
  onDone,
}: {
  studentTestId: string;
  maxMarksHint?: string;
  onDone: () => void;
}) {
  const gradeSubmission = useGradeSubmission();
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const pending = gradeSubmission.isPending;
  const error = gradeSubmission.error;

  const submit = () => {
    gradeSubmission.mutate(
      { studentTestId, marksObtained: Number(marks), teacherFeedback: feedback || null },
      { onSuccess: onDone },
    );
  };

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Field label="Marks obtained" hint={maxMarksHint}>
        <Input
          type="number"
          min={0}
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
          required
        />
      </Field>
      <Field label="Feedback" hint="Optional">
        <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} />
      </Field>
      {error && <p className="text-sm text-danger">{error.message}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={pending}>
          Save grade
        </Button>
      </div>
    </form>
  );
}
