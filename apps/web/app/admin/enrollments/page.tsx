'use client';

import {
  useCreateEnrollment,
  useGetAdminPaginatedUsers,
  useGetClasses,
  useGetEnrollments,
  useSoftDeleteEnrollment,
  useUpdateEnrollment,
} from '@ecomerece/frontend';
import type { EnrollmentResponseDto, GetEnrollmentsType } from '@ecomerece/shared';
import { Badge, Button, Field, Input, Modal, Select } from '@ecomerece/ui';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { useState } from 'react';

const PAGE_SIZE = 20;

export default function AdminEnrollmentsPage() {
  const [search, setSearch] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<EnrollmentResponseDto | null>(null);
  const [deleting, setDeleting] = useState<EnrollmentResponseDto | null>(null);

  const params: GetEnrollmentsType = {
    search: search.trim() || undefined,
    academicYear: academicYear.trim() || undefined,
    cursor,
    limit: PAGE_SIZE,
    direction: 'next',
  };
  const list = useGetEnrollments(params);
  const createEnrollment = useCreateEnrollment();
  const updateEnrollment = useUpdateEnrollment();
  const softDeleteEnrollment = useSoftDeleteEnrollment();

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? null;
  const busy =
    createEnrollment.isPending || updateEnrollment.isPending || softDeleteEnrollment.isPending;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Enrollments</h1>
          <p className="mt-1 text-sm text-ink-3">
            One live enrollment per student per academic year.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> New enrollment
        </Button>
      </header>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCursor(undefined);
            }}
            aria-label="Search enrollments"
          />
        </div>
        <div className="sm:w-44">
          <Input
            placeholder="2026-2027"
            value={academicYear}
            onChange={(e) => {
              setAcademicYear(e.target.value);
              setCursor(undefined);
            }}
            aria-label="Filter by academic year"
          />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
        <div className="overflow-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line/10">
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Student ID</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Class ID</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Roll</th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 sm:table-cell">
                  Year
                </th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Status</th>
                <th className="px-3 py-2" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line/5">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-ink-3">
                    {list.isLoading ? 'Loading…' : 'No enrollments yet'}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-3">
                  <td className="max-w-40 truncate px-3 py-2 font-mono text-xs text-ink-2">
                    {row.studentId}
                  </td>
                  <td className="max-w-40 truncate px-3 py-2 font-mono text-xs text-ink-2">
                    {row.classId}
                  </td>
                  <td className="px-3 py-2 text-sm text-ink">{row.rollNumber ?? '—'}</td>
                  <td className="hidden px-3 py-2 font-mono text-sm text-ink-2 sm:table-cell">
                    {row.academicYear}
                  </td>
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
        title={editing ? 'Edit enrollment' : 'New enrollment'}
      >
        <EnrollmentForm
          key={editing?.id ?? 'create'}
          mode={editing ? 'edit' : 'create'}
          initial={editing}
          onDone={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Delete enrollment?">
        <p className="text-sm text-ink-2">
          {deleting
            ? `Enrollment ${deleting.id.slice(0, 8)}… (${deleting.academicYear}) will be soft-deleted.`
            : ''}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={softDeleteEnrollment.isPending}
            onClick={() => {
              if (!deleting) return;
              softDeleteEnrollment.mutate(
                { enrollmentId: deleting.id, reason: 'Deleted from admin console' },
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

function EnrollmentForm({
  mode,
  initial,
  onDone,
}: {
  mode: 'create' | 'edit';
  initial: EnrollmentResponseDto | null;
  onDone: () => void;
}) {
  const createEnrollment = useCreateEnrollment();
  const updateEnrollment = useUpdateEnrollment();
  // Pickers instead of UUID inputs (new.md §10).
  const classes = useGetClasses({ limit: 50 });
  const classOptions = classes.data?.data ?? [];
  const students = useGetAdminPaginatedUsers({ role: 'student', limit: 50 });
  const studentOptions = students.data?.data ?? [];
  const [form, setForm] = useState({
    studentId: initial?.studentId ?? '',
    classId: initial?.classId ?? '',
    rollNumber: initial?.rollNumber ?? '',
  });
  const pending = createEnrollment.isPending || updateEnrollment.isPending;
  const error = createEnrollment.error ?? updateEnrollment.error;

  const submit = () => {
    if (mode === 'create') {
      createEnrollment.mutate(
        {
          studentId: form.studentId,
          classId: form.classId,
          rollNumber: form.rollNumber || undefined,
        },
        { onSuccess: onDone },
      );
    } else if (initial) {
      updateEnrollment.mutate(
        {
          enrollmentId: initial.id,
          classId: form.classId !== initial.classId ? form.classId : undefined,
          rollNumber:
            (form.rollNumber || null) !== initial.rollNumber ? form.rollNumber || null : undefined,
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
      {mode === 'create' && (
        <Field label="Student">
          <Select
            value={form.studentId}
            onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
            required
          >
            <option value="">
              {students.isLoading ? 'Loading students…' : 'Select a student'}
            </option>
            {studentOptions.map((student) => (
              <option key={student.id} value={student.id}>
                {student.fullName}
              </option>
            ))}
          </Select>
        </Field>
      )}
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
      <Field label="Roll number" hint="Optional, e.g. 12">
        <Input
          value={form.rollNumber}
          onChange={(e) => setForm((f) => ({ ...f, rollNumber: e.target.value }))}
        />
      </Field>
      {error && <p className="text-sm text-danger">{error.message}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={pending}>
          {mode === 'create' ? 'Create enrollment' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
