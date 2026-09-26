'use client';

import {
  useCreateAssignment,
  useGetAssignments,
  useGetSubjects,
  useTeacherContext,
} from '@ecomerece/frontend';
import type { AssignmentType } from '@ecomerece/shared';
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
import { AlertTriangle, ClipboardList, Plus } from 'lucide-react';
import { useState } from 'react';

const PAGE_SIZE = 20;
const ASSIGNMENT_TYPES: AssignmentType[] = ['homework', 'test', 'oral'];

function todayIso(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export default function TeacherAssignmentsPage() {
  const { classes, hasClasses, isLoading: classesLoading, schoolId } = useTeacherContext();

  if (classesLoading && !hasClasses) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Card padding="lg" className="flex items-center gap-3">
          <Spinner />
          <span className="text-sm text-ink-3">Loading your classes…</span>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Assignments</h1>
        <p className="mt-1 text-sm text-ink-3">
          Set work for your classes and keep track of what is due.
        </p>
      </header>

      {!hasClasses && (
        <div className="mt-6">
          <EmptyState
            icon={ClipboardList}
            title="No classes assigned yet"
            description="You are not the class teacher of any class, so there is nothing to set. An administrator needs to assign you first."
          />
        </div>
      )}

      {hasClasses && (
        <>
          <NewAssignment
            classOptions={classes.map((c) => ({ id: c.id, name: c.name }))}
            schoolId={schoolId}
          />
          <AssignmentList classOptions={classes.map((c) => ({ id: c.id, name: c.name }))} />
        </>
      )}
    </div>
  );
}

function NewAssignment({
  classOptions,
  schoolId,
}: {
  classOptions: Array<{ id: string; name: string }>;
  schoolId: string | undefined;
}) {
  const subjects = useGetSubjects({ schoolId, limit: 50 }, { enabled: Boolean(schoolId) });
  const createAssignment = useCreateAssignment();

  const [classId, setClassId] = useState(classOptions[0]?.id ?? '');
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AssignmentType>('homework');
  const [dueDate, setDueDate] = useState(todayIso);
  const [totalMarks, setTotalMarks] = useState('100');
  const [formError, setFormError] = useState<string | null>(null);

  const subjectOptions = subjects.data?.data ?? [];
  const isValid =
    Boolean(schoolId) &&
    Boolean(classId) &&
    Boolean(subjectId) &&
    title.trim().length >= 3 &&
    Boolean(dueDate);

  const submit = () => {
    setFormError(null);
    if (!schoolId || !isValid) {
      setFormError('Fill in a class, a subject, a title of at least 3 characters, and a due date.');
      return;
    }
    createAssignment.mutate(
      {
        schoolId,
        classId,
        subjectId,
        // teacherId is omitted: the API attributes the work to the authenticated teacher.
        title: title.trim(),
        description: description.trim() ? description.trim() : undefined,
        type,
        dueDate: new Date(dueDate),
        totalMarks: Number(totalMarks) || 100,
      },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
        },
      },
    );
  };

  return (
    <Card
      padding="lg"
      className="mt-6"
      title="New assignment"
      description="Assigned to you automatically. It appears in your list once saved."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Class" htmlFor="assignment-class">
          <Select
            id="assignment-class"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            {classOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Subject" htmlFor="assignment-subject">
          <Select
            id="assignment-subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            <option value="">
              {subjects.isLoading ? 'Loading subjects…' : 'Select a subject'}
            </option>
            {subjectOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Title" htmlFor="assignment-title" className="sm:col-span-2">
          <Input
            id="assignment-title"
            value={title}
            maxLength={150}
            placeholder="e.g. Fractions worksheet"
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>

        <Field label="Description" htmlFor="assignment-description" className="sm:col-span-2">
          <Textarea
            id="assignment-description"
            rows={3}
            value={description}
            maxLength={2000}
            placeholder="Optional instructions for students"
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <Field label="Type" htmlFor="assignment-type">
          <Select
            id="assignment-type"
            value={type}
            onChange={(e) => setType(e.target.value as AssignmentType)}
          >
            {ASSIGNMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Due date" htmlFor="assignment-due">
          <Input
            id="assignment-due"
            type="date"
            min={todayIso()}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </Field>

        <Field label="Total marks" htmlFor="assignment-marks">
          <Input
            id="assignment-marks"
            type="number"
            min={1}
            max={1000}
            value={totalMarks}
            onChange={(e) => setTotalMarks(e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button
          variant="primary"
          isLoading={createAssignment.isPending}
          disabled={!isValid}
          onClick={submit}
        >
          <Plus className="size-4" /> Create
        </Button>
        {createAssignment.isSuccess && !createAssignment.isPending && (
          <span className="text-sm text-ink-3">Assignment created.</span>
        )}
      </div>

      {(formError || createAssignment.error) && (
        <p className="mt-3 text-sm text-danger">
          {formError ?? (createAssignment.error as Error).message}
        </p>
      )}
    </Card>
  );
}

function AssignmentList({ classOptions }: { classOptions: Array<{ id: string; name: string }> }) {
  const { schoolId, teacherId } = useTeacherContext();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [type, setType] = useState<AssignmentType | ''>('');

  const list = useGetAssignments({
    schoolId,
    teacherId,
    cursor,
    limit: PAGE_SIZE,
    direction: 'next',
    type: type || undefined,
  });
  const subjects = useGetSubjects({ schoolId, limit: 50 }, { enabled: Boolean(schoolId) });

  const classNameById = new Map(classOptions.map((c) => [c.id, c.name]));
  const subjectNameById = new Map((subjects.data?.data ?? []).map((s) => [s.id, s.name]));
  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? null;

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">Your assignments</h2>
        <div className="w-48">
          <Select
            aria-label="Filter by type"
            value={type}
            onChange={(e) => {
              setType(e.target.value as AssignmentType | '');
              setCursor(undefined);
            }}
          >
            <option value="">All types</option>
            {ASSIGNMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {rows.length === 0 && !list.isLoading ? (
        <div className="mt-4">
          <EmptyState
            icon={ClipboardList}
            title="No assignments yet"
            description="Create one above and it will show up here."
          />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((assignment) => {
            const due = new Date(assignment.dueDate);
            const daysLeft = Math.ceil((due.getTime() - Date.now()) / 86_400_000);
            const overdue = daysLeft < 0;
            const soon = !overdue && daysLeft <= 2;
            return (
              <Card key={assignment.id} padding="lg">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-ink">{assignment.title}</p>
                      <Badge tone="neutral">{assignment.type}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink-3">
                      {classNameById.get(assignment.classId) ?? 'Unknown class'} ·{' '}
                      {subjectNameById.get(assignment.subjectId) ?? 'Unknown subject'} ·{' '}
                      {assignment.totalMarks} marks
                    </p>
                    {assignment.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-ink-2">
                        {assignment.description}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-ink-3">Due</p>
                    <p className="text-sm text-ink-2">{due.toLocaleDateString()}</p>
                    {(overdue || soon) && (
                      <p
                        className={`mt-1 flex items-center justify-end gap-1 text-xs ${
                          overdue ? 'text-danger' : 'text-warning'
                        }`}
                      >
                        <AlertTriangle className="size-3" aria-hidden="true" />
                        {overdue
                          ? `${Math.abs(daysLeft)}d overdue`
                          : daysLeft === 0
                            ? 'due today'
                            : `due in ${daysLeft}d`}
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
