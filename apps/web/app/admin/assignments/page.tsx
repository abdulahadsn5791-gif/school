'use client';

import {
  useCreateAssignment,
  useGetAdminPaginatedUsers,
  useGetAssignments,
  useGetClasses,
  useGetSchools,
  useGetSubjects,
  useSoftDeleteAssignment,
  useUpdateAssignment,
} from '@ecomerece/frontend';
import type { AssignmentResponseDto, GetAssignmentsType } from '@ecomerece/shared';
import { Badge, Button, Field, Input, Modal, Select, Textarea } from '@ecomerece/ui';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';

const PAGE_SIZE = 20;

const TYPES = ['homework', 'test', 'oral'] as const;
type AssignmentType = (typeof TYPES)[number];

export default function AdminAssignmentsPage() {
  const [type, setType] = useState<AssignmentType | ''>('');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AssignmentResponseDto | null>(null);
  const [deleting, setDeleting] = useState<AssignmentResponseDto | null>(null);

  const params: GetAssignmentsType = {
    type: type || undefined,
    cursor,
    limit: PAGE_SIZE,
    direction: 'next',
  };
  const list = useGetAssignments(params);
  const createAssignment = useCreateAssignment();
  const updateAssignment = useUpdateAssignment();
  const softDeleteAssignment = useSoftDeleteAssignment();

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? null;
  const busy =
    createAssignment.isPending || updateAssignment.isPending || softDeleteAssignment.isPending;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Assignments</h1>
          <p className="mt-1 text-sm text-ink-3">
            Homework, tests, and orals. Type and class/subject/teacher are immutable after create.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> New assignment
        </Button>
      </header>

      <div className="mt-4 sm:w-44">
        <Select
          value={type}
          onChange={(e) => {
            setType(e.target.value as AssignmentType | '');
            setCursor(undefined);
          }}
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
        <div className="overflow-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-line/10">
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Title</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Type</th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 md:table-cell">
                  Due
                </th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Marks</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Status</th>
                <th className="px-3 py-2" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line/5">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-ink-3">
                    {list.isLoading ? 'Loading…' : 'No assignments yet'}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-3">
                  <td className="max-w-64 truncate px-3 py-2 text-sm font-medium text-ink">
                    {row.title}
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone="neutral">{row.type}</Badge>
                  </td>
                  <td className="hidden px-3 py-2 text-sm text-ink-2 md:table-cell">
                    {new Date(row.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 font-mono text-sm text-ink-2">{row.totalMarks}</td>
                  <td className="px-3 py-2">
                    {row.isDeleted ? (
                      <Badge tone="danger">Deleted</Badge>
                    ) : (
                      <Badge tone="success">Active</Badge>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(row)}>
                        Edit
                      </Button>
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
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={editing ? 'Edit assignment' : 'New assignment'}
        size="lg"
      >
        <AssignmentForm
          key={editing?.id ?? 'create'}
          mode={editing ? 'edit' : 'create'}
          initial={editing}
          onDone={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Delete assignment?">
        <p className="text-sm text-ink-2">
          {deleting ? `“${deleting.title}” will be soft-deleted.` : ''}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={softDeleteAssignment.isPending}
            onClick={() => {
              if (!deleting) return;
              softDeleteAssignment.mutate(
                { assignmentId: deleting.id, reason: 'Deleted from admin console' },
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

function AssignmentForm({
  mode,
  initial,
  onDone,
}: {
  mode: 'create' | 'edit';
  initial: AssignmentResponseDto | null;
  onDone: () => void;
}) {
  const createAssignment = useCreateAssignment();
  const updateAssignment = useUpdateAssignment();
  const [form, setForm] = useState({
    schoolId: initial?.schoolId ?? '',
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    type: (initial?.type ?? 'homework') as AssignmentType,
    classId: initial?.classId ?? '',
    subjectId: initial?.subjectId ?? '',
    teacherId: initial?.teacherId ?? '',
    dueDate: initial ? new Date(initial.dueDate).toISOString().slice(0, 10) : '',
    totalMarks: initial?.totalMarks ?? 100,
  });
  const pending = createAssignment.isPending || updateAssignment.isPending;
  const error = createAssignment.error ?? updateAssignment.error;

  // Pickers instead of UUID inputs (new.md §10).
  const schools = useGetSchools({ limit: 50 });
  const schoolOptions = schools.data?.data ?? [];
  const classes = useGetClasses({ limit: 50 });
  const classOptions = (classes.data?.data ?? []).filter(
    (clazz) => !form.schoolId || clazz.schoolId === form.schoolId,
  );
  const subjects = useGetSubjects(
    { schoolId: form.schoolId, limit: 50 },
    { enabled: Boolean(form.schoolId) },
  );
  const subjectOptions = subjects.data?.data ?? [];
  const teachers = useGetAdminPaginatedUsers({ role: 'teacher', limit: 50 });
  const teacherOptions = teachers.data?.data ?? [];

  const submit = () => {
    if (mode === 'create') {
      createAssignment.mutate(
        {
          schoolId: form.schoolId,
          title: form.title,
          description: form.description || undefined,
          type: form.type,
          classId: form.classId,
          subjectId: form.subjectId,
          teacherId: form.teacherId,
          dueDate: new Date(form.dueDate),
          totalMarks: form.totalMarks || undefined,
        },
        { onSuccess: onDone },
      );
    } else if (initial) {
      updateAssignment.mutate(
        {
          assignmentId: initial.id,
          title: form.title !== initial.title ? form.title : undefined,
          description:
            form.description !== (initial.description ?? '') ? form.description || null : undefined,
          dueDate:
            form.dueDate !== new Date(initial.dueDate).toISOString().slice(0, 10)
              ? new Date(form.dueDate)
              : undefined,
          totalMarks: form.totalMarks !== initial.totalMarks ? form.totalMarks : undefined,
        },
        { onSuccess: onDone },
      );
    }
  };

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Field label="Title">
        <Input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
      </Field>
      <Field label="Description" hint="Optional">
        <Textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
        />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Type">
          <Select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AssignmentType }))}
            disabled={mode === 'edit'}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Due date">
          <Input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            required
          />
        </Field>
        <Field label="Total marks" hint="1–1000">
          <Input
            type="number"
            min={1}
            max={1000}
            value={form.totalMarks}
            onChange={(e) => setForm((f) => ({ ...f, totalMarks: Number(e.target.value) }))}
          />
        </Field>
      </div>
      {mode === 'create' && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="School">
            <Select
              value={form.schoolId}
              onChange={(e) => setForm((f) => ({ ...f, schoolId: e.target.value }))}
              required
            >
              <option value="">{schools.isLoading ? 'Loading schools…' : 'Select a school'}</option>
              {schoolOptions.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name} ({school.code})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Class">
            <Select
              value={form.classId}
              onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
              required
            >
              <option value="">{classes.isLoading ? 'Loading classes…' : 'Select a class'}</option>
              {classOptions.map((clazz) => (
                <option key={clazz.id} value={clazz.id}>
                  {clazz.name} · {clazz.academicYear}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Subject">
            <Select
              value={form.subjectId}
              onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
              required
            >
              <option value="">
                {subjects.isLoading ? 'Loading subjects…' : 'Select a subject'}
              </option>
              {subjectOptions.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Teacher">
            <Select
              value={form.teacherId}
              onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}
              required
            >
              <option value="">
                {teachers.isLoading ? 'Loading teachers…' : 'Select a teacher'}
              </option>
              {teacherOptions.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      )}
      {error && <p className="text-sm text-danger">{error.message}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={pending}>
          {mode === 'create' ? 'Create assignment' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
