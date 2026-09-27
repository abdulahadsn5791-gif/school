'use client';

import {
  useGetSubmissions,
  useGradeSubmission,
  useMarkMissed,
  useStudentNameIndex,
  useTeacherAssignmentsIndex,
  useTeacherContext,
} from '@ecomerece/frontend';
import type { StudentTestResponseDto } from '@ecomerece/shared';
import { Badge, Button, Card, EmptyState, Field, Input, Textarea } from '@ecomerece/ui';
import { CheckCheck, CircleSlash, ScrollText } from 'lucide-react';
import { useMemo, useState } from 'react';

const PAGE_SIZE = 20;

type QueueFilter = 'SUBMITTED' | 'PENDING' | 'GRADED' | 'MISSED' | 'ALL';

const FILTERS: Array<{ value: QueueFilter; label: string }> = [
  { value: 'SUBMITTED', label: 'Awaiting grade' },
  { value: 'PENDING', label: 'Not submitted' },
  { value: 'GRADED', label: 'Graded' },
  { value: 'MISSED', label: 'Missed' },
  { value: 'ALL', label: 'All' },
];

const STATUS_TONE: Record<
  StudentTestResponseDto['status'],
  'success' | 'warning' | 'neutral' | 'danger'
> = {
  GRADED: 'success',
  SUBMITTED: 'warning',
  PENDING: 'neutral',
  MISSED: 'danger',
};

export default function TeacherGradingPage() {
  const { schoolId, hasClasses } = useTeacherContext();
  const [filter, setFilter] = useState<QueueFilter>('SUBMITTED');
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const index = useTeacherAssignmentsIndex();

  const list = useGetSubmissions(
    {
      schoolId,
      cursor,
      limit: PAGE_SIZE,
      direction: 'next',
      status: filter === 'ALL' ? undefined : filter,
    },
    // Without a resolved school the API returns nothing, so skip the request.
    { enabled: Boolean(schoolId) },
  );

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? null;

  // Names are resolved per class; only the classes on this page are fetched.
  const classIds = useMemo(
    () =>
      rows
        .map((row) => index.byId.get(row.assignmentId)?.classId)
        .filter((id): id is string => Boolean(id)),
    [rows, index.byId],
  );
  const names = useStudentNameIndex(classIds);

  const changeFilter = (next: QueueFilter) => {
    setFilter(next);
    setCursor(undefined);
  };

  if (!hasClasses) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <EmptyState
          icon={ScrollText}
          title="No classes assigned yet"
          description="You are not the class teacher of any class, so there is nothing to grade. An administrator needs to assign you first."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Grading</h1>
        <p className="mt-1 text-sm text-ink-3">
          Submissions for the assignments you set. Only your own work appears here.
        </p>
      </header>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((option) => (
          <Button
            key={option.value}
            variant={filter === option.value ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => changeFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {index.isTruncated && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3">
          <p className="text-sm text-ink-2">
            You have a very large assignment history, so the oldest entries may not be listed here.
          </p>
        </div>
      )}

      {names.isError && (
        <p className="mt-4 text-sm text-danger">
          Could not load student names: {names.error?.message}
        </p>
      )}

      {rows.length === 0 && !list.isLoading ? (
        <div className="mt-6">
          <EmptyState
            icon={ScrollText}
            title="Nothing here"
            description={
              filter === 'SUBMITTED'
                ? 'No submissions are waiting on a grade.'
                : 'No submissions match this filter.'
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((row) => {
            const assignment = index.byId.get(row.assignmentId);
            return (
              <SubmissionRow
                key={row.id}
                submission={row}
                assignmentTitle={assignment?.title}
                totalMarks={assignment?.totalMarks}
                classId={assignment?.classId}
                studentName={names.byId.get(row.studentId)?.fullName}
                rollNumber={names.byId.get(row.studentId)?.rollNumber}
              />
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
    </div>
  );
}

function SubmissionRow({
  submission,
  assignmentTitle,
  totalMarks,
  classId,
  studentName,
  rollNumber,
}: {
  submission: StudentTestResponseDto;
  assignmentTitle: string | undefined;
  totalMarks: number | undefined;
  classId: string | undefined;
  studentName: string | undefined;
  rollNumber: string | null | undefined;
}) {
  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-ink">{studentName ?? 'Unknown student'}</p>
            {rollNumber && <span className="font-mono text-xs text-ink-3">#{rollNumber}</span>}
            <Badge tone={STATUS_TONE[submission.status]}>{submission.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-3">
            {assignmentTitle ?? 'Unknown assignment'}
            {totalMarks !== undefined && ` · out of ${totalMarks}`}
          </p>
          {submission.submittedAt && (
            <p className="mt-0.5 text-xs text-ink-3">
              Submitted {new Date(submission.submittedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {submission.submissionText && (
        <div className="mt-3 rounded-2xl bg-surface-2 p-3">
          <p className="whitespace-pre-wrap text-sm text-ink-2">{submission.submissionText}</p>
        </div>
      )}
      {submission.submissionFiles.length > 0 && (
        <ul className="mt-3 space-y-1">
          {submission.submissionFiles.map((file) => (
            <li key={file} className="truncate font-mono text-xs text-ink-3">
              {file}
            </li>
          ))}
        </ul>
      )}

      {submission.status === 'GRADED' ? (
        <div className="mt-4 border-t border-line/10 pt-4">
          <p className="text-sm text-ink-2">
            <span className="font-semibold text-ink">
              {submission.marksObtained ?? 0}
              {totalMarks !== undefined ? ` / ${totalMarks}` : ''}
            </span>{' '}
            awarded
            {submission.gradedAt && (
              <span className="text-ink-3">
                {' '}
                on {new Date(submission.gradedAt).toLocaleDateString()}
              </span>
            )}
          </p>
          {submission.teacherFeedback && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-2">
              {submission.teacherFeedback}
            </p>
          )}
        </div>
      ) : (
        <GradeForm
          submission={submission}
          totalMarks={totalMarks}
          classId={classId}
          canMarkMissed={submission.status === 'PENDING' || submission.status === 'SUBMITTED'}
        />
      )}
    </Card>
  );
}

function GradeForm({
  submission,
  totalMarks,
  classId,
  canMarkMissed,
}: {
  submission: StudentTestResponseDto;
  totalMarks: number | undefined;
  classId: string | undefined;
  canMarkMissed: boolean;
}) {
  const grade = useGradeSubmission();
  const markMissed = useMarkMissed();
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const submit = () => {
    setFormError(null);
    const value = Number(marks);
    if (marks.trim() === '' || !Number.isFinite(value) || value < 0) {
      setFormError('Enter a mark value of zero or more.');
      return;
    }
    // The API enforces this too; checking here avoids a round trip for a typo.
    if (totalMarks !== undefined && value > totalMarks) {
      setFormError(`Marks cannot exceed the assignment total of ${totalMarks}.`);
      return;
    }
    grade.mutate(
      {
        studentTestId: submission.id,
        marksObtained: value,
        teacherFeedback: feedback.trim() ? feedback.trim() : null,
      },
      { onSuccess: () => setFormError(null) },
    );
  };

  const error =
    formError ??
    (grade.error as Error | null)?.message ??
    (markMissed.error as Error | null)?.message;

  return (
    <div className="mt-4 border-t border-line/10 pt-4">
      {submission.status === 'SUBMITTED' ? (
        <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
          <Field label="Marks" htmlFor={`marks-${submission.id}`}>
            <Input
              id={`marks-${submission.id}`}
              type="number"
              min={0}
              max={totalMarks}
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
            />
          </Field>
          <Field label="Feedback" htmlFor={`feedback-${submission.id}`}>
            <Textarea
              id={`feedback-${submission.id}`}
              rows={2}
              maxLength={2000}
              placeholder="Optional comment for the student"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </Field>
        </div>
      ) : (
        <p className="text-sm text-ink-3">
          Not submitted yet, so there is nothing to grade. You can record it as missed.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {submission.status === 'SUBMITTED' && (
          <Button variant="primary" size="sm" isLoading={grade.isPending} onClick={submit}>
            <CheckCheck className="size-4" /> Save grade
          </Button>
        )}
        {canMarkMissed && (
          <Button
            variant="secondary"
            size="sm"
            isLoading={markMissed.isPending}
            onClick={() => markMissed.mutate({ studentTestId: submission.id })}
          >
            <CircleSlash className="size-4" /> Mark missed
          </Button>
        )}
        {grade.isSuccess && !grade.isPending && (
          <span className="text-sm text-ink-3">Grade saved.</span>
        )}
        {markMissed.isSuccess && !markMissed.isPending && (
          <span className="text-sm text-ink-3">Marked as missed.</span>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      {!classId && submission.status !== 'PENDING' && (
        <p className="mt-2 text-xs text-ink-3">
          The assignment for this submission is not loaded, so its mark ceiling is unknown.
        </p>
      )}
    </div>
  );
}
