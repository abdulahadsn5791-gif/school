'use client';

import {
  useCreateTimetableEntry,
  useGetTimetableEntries,
  useSoftDeleteTimetableEntry,
  useUpdateTimetableEntry,
} from '@ecomerece/frontend';
import type { GetTimetableEntriesType, TimetableEntryResponseDto } from '@ecomerece/shared';
import { Badge, Button, Field, Input, Modal, Select } from '@ecomerece/ui';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';

const PAGE_SIZE = 20;

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
type DayOfWeek = (typeof DAYS)[number];

export default function AdminTimetablePage() {
  const [day, setDay] = useState<DayOfWeek | ''>('');
  const [academicYear, setAcademicYear] = useState('');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TimetableEntryResponseDto | null>(null);
  const [deleting, setDeleting] = useState<TimetableEntryResponseDto | null>(null);

  const params: GetTimetableEntriesType = {
    dayOfWeek: day || undefined,
    academicYear: academicYear.trim() || undefined,
    cursor,
    limit: PAGE_SIZE,
    direction: 'next',
  };
  const list = useGetTimetableEntries(params);
  const createEntry = useCreateTimetableEntry();
  const updateEntry = useUpdateTimetableEntry();
  const softDeleteEntry = useSoftDeleteTimetableEntry();

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta ?? null;
  const busy = createEntry.isPending || updateEntry.isPending || softDeleteEntry.isPending;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Timetable</h1>
          <p className="mt-1 text-sm text-ink-3">
            Class slots per day. Class and teacher slot conflicts are rejected by the API.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> New entry
        </Button>
      </header>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="sm:w-44">
          <Select
            value={day}
            onChange={(e) => {
              setDay(e.target.value as DayOfWeek | '');
              setCursor(undefined);
            }}
            aria-label="Filter by day"
          >
            <option value="">All days</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
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
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-line/10">
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Day</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Class</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Subject</th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 md:table-cell">
                  Teacher
                </th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 md:table-cell">
                  Period
                </th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Year</th>
                <th className="px-3 py-2" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line/5">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-sm text-ink-3">
                    {list.isLoading ? 'Loading…' : 'No timetable entries'}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-3">
                  <td className="px-3 py-2">
                    <Badge tone="neutral">{row.dayOfWeek}</Badge>
                  </td>
                  <td className="max-w-32 truncate px-3 py-2 font-mono text-xs text-ink-2">
                    {row.classId}
                  </td>
                  <td className="max-w-32 truncate px-3 py-2 font-mono text-xs text-ink-2">
                    {row.subjectId}
                  </td>
                  <td className="hidden max-w-32 truncate px-3 py-2 font-mono text-xs text-ink-2 md:table-cell">
                    {row.teacherId}
                  </td>
                  <td className="hidden max-w-32 truncate px-3 py-2 font-mono text-xs text-ink-2 md:table-cell">
                    {row.periodId}
                  </td>
                  <td className="px-3 py-2 font-mono text-sm text-ink-2">{row.academicYear}</td>
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
        title={editing ? 'Edit entry' : 'New entry'}
        size="lg"
      >
        <TimetableForm
          key={editing?.id ?? 'create'}
          mode={editing ? 'edit' : 'create'}
          initial={editing}
          onDone={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Delete entry?">
        <p className="text-sm text-ink-2">
          {deleting
            ? `${deleting.dayOfWeek} slot for ${deleting.classId.slice(0, 8)}… will be soft-deleted.`
            : ''}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={softDeleteEntry.isPending}
            onClick={() => {
              if (!deleting) return;
              softDeleteEntry.mutate(
                { timetableEntryId: deleting.id, reason: 'Deleted from admin console' },
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

function TimetableForm({
  mode,
  initial,
  onDone,
}: {
  mode: 'create' | 'edit';
  initial: TimetableEntryResponseDto | null;
  onDone: () => void;
}) {
  const createEntry = useCreateTimetableEntry();
  const updateEntry = useUpdateTimetableEntry();
  const [form, setForm] = useState({
    schoolId: initial?.schoolId ?? '',
    academicYear: initial?.academicYear ?? '',
    classId: initial?.classId ?? '',
    subjectId: initial?.subjectId ?? '',
    teacherId: initial?.teacherId ?? '',
    periodId: initial?.periodId ?? '',
    dayOfWeek: (initial?.dayOfWeek ?? 'MONDAY') as DayOfWeek,
  });
  const pending = createEntry.isPending || updateEntry.isPending;
  const error = createEntry.error ?? updateEntry.error;

  const submit = () => {
    if (mode === 'create') {
      createEntry.mutate(
        {
          schoolId: form.schoolId,
          academicYear: form.academicYear,
          classId: form.classId,
          subjectId: form.subjectId,
          teacherId: form.teacherId,
          periodId: form.periodId,
          dayOfWeek: form.dayOfWeek,
        },
        { onSuccess: onDone },
      );
    } else if (initial) {
      updateEntry.mutate(
        {
          timetableEntryId: initial.id,
          subjectId: form.subjectId !== initial.subjectId ? form.subjectId : undefined,
          teacherId: form.teacherId !== initial.teacherId ? form.teacherId : undefined,
          periodId: form.periodId !== initial.periodId ? form.periodId : undefined,
          dayOfWeek: form.dayOfWeek !== initial.dayOfWeek ? form.dayOfWeek : undefined,
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
          <div className="grid grid-cols-2 gap-3">
            <Field label="School ID">
              <Input
                value={form.schoolId}
                onChange={(e) => setForm((f) => ({ ...f, schoolId: e.target.value }))}
                required
              />
            </Field>
            <Field label="Academic year" hint="2026-2027">
              <Input
                value={form.academicYear}
                onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))}
                required
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Class ID">
              <Input
                value={form.classId}
                onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
                required
              />
            </Field>
            <Field label="Period ID">
              <Input
                value={form.periodId}
                onChange={(e) => setForm((f) => ({ ...f, periodId: e.target.value }))}
                required
              />
            </Field>
          </div>
        </>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Subject ID">
          <Input
            value={form.subjectId}
            onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
            required
          />
        </Field>
        <Field label="Teacher ID">
          <Input
            value={form.teacherId}
            onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}
            required
          />
        </Field>
      </div>
      <Field label="Day of week">
        <Select
          value={form.dayOfWeek}
          onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: e.target.value as DayOfWeek }))}
        >
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
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
          {mode === 'create' ? 'Create entry' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
