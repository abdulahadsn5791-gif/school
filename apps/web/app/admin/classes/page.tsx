'use client';

import {
  useCreateClass,
  useGetAdminPaginatedUsers,
  useGetClasses,
  useGetSchools,
  useSoftDeleteClass,
  useUpdateClass,
} from '@ecomerece/frontend';
import type { ClassResponseDto, GetClassesType } from '@ecomerece/shared';
import { Badge, Button, Field, Input, Modal, Select } from '@ecomerece/ui';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { useState } from 'react';

const PAGE_SIZE = 20;

export default function AdminClassesPage() {
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ClassResponseDto | null>(null);
  const [deleting, setDeleting] = useState<ClassResponseDto | null>(null);

  const params: GetClassesType = {
    search: search.trim() || undefined,
    cursor,
    limit: PAGE_SIZE,
    direction: 'next',
  };
  const list = useGetClasses(params);
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const softDeleteClass = useSoftDeleteClass();

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? null;
  const busy = createClass.isPending || updateClass.isPending || softDeleteClass.isPending;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Classes</h1>
          <p className="mt-1 text-sm text-ink-3">Grade/section cohorts per academic year.</p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> New class
        </Button>
      </header>

      <div className="mt-4">
        <Input
          icon={Search}
          placeholder="Search by name…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCursor(undefined);
          }}
          aria-label="Search classes"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
        <div className="overflow-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line/10">
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Name</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Grade</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Section</th>
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
                    {list.isLoading ? 'Loading…' : 'No classes yet'}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-3">
                  <td className="px-3 py-2 text-sm font-medium text-ink">{row.name}</td>
                  <td className="px-3 py-2 text-sm text-ink-2">{row.grade}</td>
                  <td className="px-3 py-2 text-sm text-ink-2">{row.section}</td>
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
        title={editing ? 'Edit class' : 'New class'}
      >
        <ClassForm
          key={editing?.id ?? 'create'}
          mode={editing ? 'edit' : 'create'}
          initial={editing}
          onDone={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Delete class?">
        <p className="text-sm text-ink-2">
          {deleting ? `${deleting.name} (${deleting.academicYear}) will be soft-deleted.` : ''}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={softDeleteClass.isPending}
            onClick={() => {
              if (!deleting) return;
              softDeleteClass.mutate(
                { classId: deleting.id, reason: 'Deleted from admin console' },
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

function ClassForm({
  mode,
  initial,
  onDone,
}: {
  mode: 'create' | 'edit';
  initial: ClassResponseDto | null;
  onDone: () => void;
}) {
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  // Schools come from the engine's list; the form sends the chosen school's id.
  const schools = useGetSchools({ limit: 50 });
  const schoolOptions = (schools.data?.data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
  }));
  const [form, setForm] = useState({
    schoolId: initial?.schoolId ?? '',
    name: initial?.name ?? '',
    grade: initial?.grade ?? '',
    section: initial?.section ?? '',
    academicYear: initial?.academicYear ?? '',
    classTeacherId: initial?.classTeacherId ?? '',
  });
  const teachers = useGetAdminPaginatedUsers({ role: 'teacher', limit: 50 });
  const teacherOptions = teachers.data?.data ?? [];
  const pending = createClass.isPending || updateClass.isPending;
  const error = createClass.error ?? updateClass.error;

  const submit = () => {
    if (mode === 'create') {
      createClass.mutate(
        {
          schoolId: form.schoolId,
          name: form.name,
          grade: form.grade,
          section: form.section,
          academicYear: form.academicYear,
          classTeacherId: form.classTeacherId || null,
        },
        { onSuccess: onDone },
      );
    } else if (initial) {
      updateClass.mutate(
        {
          classId: initial.id,
          name: form.name !== initial.name ? form.name : undefined,
          classTeacherId:
            (form.classTeacherId || null) !== initial.classTeacherId
              ? form.classTeacherId || null
              : undefined,
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
        <>
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
          <div className="grid grid-cols-2 gap-3">
            <Field label="Grade" hint="e.g. Grade 5">
              <Input
                value={form.grade}
                onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
                required
              />
            </Field>
            <Field label="Section" hint="e.g. A">
              <Input
                value={form.section}
                onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                required
              />
            </Field>
          </div>
          <Field label="Academic year" hint="Format 2026-2027">
            <Input
              value={form.academicYear}
              onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))}
              placeholder="2026-2027"
              required
            />
          </Field>
        </>
      )}
      <Field label="Name">
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
      </Field>
      <Field label="Class teacher" hint="Optional">
        <Select
          value={form.classTeacherId}
          onChange={(e) => setForm((f) => ({ ...f, classTeacherId: e.target.value }))}
        >
          <option value="">{teachers.isLoading ? 'Loading teachers…' : 'No class teacher'}</option>
          {teacherOptions.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.fullName}
            </option>
          ))}
        </Select>
      </Field>
      {error && <p className="text-sm text-danger">{error.message}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={pending}>
          {mode === 'create' ? 'Create class' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
