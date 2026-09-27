'use client';

import {
  useGetAdminPaginatedUsers,
  useGetClassDayAttendance,
  useGetClasses,
  useGetClassRoster,
  useGetSchools,
  useMarkAttendance,
} from '@ecomerece/frontend';
import type { AttendanceResponseDto } from '@ecomerece/shared';
import { Badge, Button, Field, Input, Select } from '@ecomerece/ui';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const;
type AttendanceStatus = (typeof STATUSES)[number];

function todayIso(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export default function AdminAttendancePage() {
  const [view, setView] = useState<'mark' | 'list'>('mark');

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Attendance</h1>
          <p className="mt-1 text-sm text-ink-3">
            Mark a class register per day, or browse recorded attendance.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'mark' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setView('mark')}
          >
            Mark register
          </Button>
          <Button
            variant={view === 'list' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setView('list')}
          >
            Browse
          </Button>
        </div>
      </header>

      {view === 'mark' ? <MarkForm /> : <AttendanceList />}
    </div>
  );
}

function MarkForm() {
  const markAttendance = useMarkAttendance();
  // Pickers instead of UUID inputs (new.md §10).
  const schools = useGetSchools({ limit: 50 });
  const schoolOptions = schools.data?.data ?? [];
  const classes = useGetClasses({ limit: 50 });
  const classOptions = (classes.data?.data ?? []).filter(
    (clazz) => !form.schoolId || clazz.schoolId === form.schoolId,
  );
  const students = useGetAdminPaginatedUsers({ role: 'student', limit: 50 });
  const studentOptions = students.data?.data ?? [];
  const [form, setForm] = useState({
    schoolId: '',
    classId: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [entries, setEntries] = useState<
    Array<{ key: number; studentId: string; status: AttendanceStatus }>
  >([{ key: 0, studentId: '', status: 'PRESENT' }]);
  const [nextKey, setNextKey] = useState(1);

  const setEntry = (
    index: number,
    patch: Partial<{ studentId: string; status: AttendanceStatus }>,
  ) => setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));

  const submit = () => {
    markAttendance.mutate(
      {
        schoolId: form.schoolId,
        classId: form.classId,
        date: new Date(form.date),
        entries: entries
          .filter((e) => e.studentId)
          .map((e) => ({ studentId: e.studentId, status: e.status })),
      },
      {
        onSuccess: () => {
          setEntries([{ key: 0, studentId: '', status: 'PRESENT' }]);
          setNextKey(1);
        },
      },
    );
  };

  return (
    <form
      className="mt-6 max-w-3xl space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="grid grid-cols-3 gap-3">
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
        <Field label="Date">
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            required
          />
        </Field>
      </div>

      <div className="space-y-2">
        {entries.map((entry, i) => (
          <div key={entry.key} className="flex items-end gap-2">
            <div className="flex-1">
              <Field label={i === 0 ? 'Student' : undefined}>
                <Select
                  value={entry.studentId}
                  onChange={(e) => setEntry(i, { studentId: e.target.value })}
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
            </div>
            <div className="w-36">
              <Field label={i === 0 ? 'Status' : undefined}>
                <Select
                  value={entry.status}
                  onChange={(e) => setEntry(i, { status: e.target.value as AttendanceStatus })}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remove entry"
              disabled={entries.length === 1}
              onClick={() => setEntries((prev) => prev.filter((_, j) => j !== i))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setEntries((prev) => [...prev, { key: nextKey, studentId: '', status: 'PRESENT' }]);
            setNextKey((k) => k + 1);
          }}
        >
          <Plus className="size-4" /> Add student
        </Button>
        <Button variant="primary" type="submit" isLoading={markAttendance.isPending}>
          Save register
        </Button>
      </div>

      {markAttendance.isError && (
        <p className="text-sm text-danger">{(markAttendance.error as Error)?.message}</p>
      )}
      {markAttendance.isSuccess && (
        <p className="text-sm text-ink-2">Register saved (idempotent re-marks are safe).</p>
      )}
    </form>
  );
}

function AttendanceList() {
  const [status, setStatus] = useState<AttendanceStatus | ''>('');
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(todayIso);

  const classes = useGetClasses({ limit: 50 });
  const options = classes.data?.data ?? [];
  const selectedClassId = classId || options[0]?.id || '';

  // The API exposes attendance per class and day, so the list is scoped that way
  // rather than paginated. An earlier version queried without classId/fromDate,
  // which the API treats as "no match" and always returned an empty list.
  const day = useGetClassDayAttendance(selectedClassId, date);
  const roster = useGetClassRoster(selectedClassId);
  const nameById = new Map((roster.data ?? []).map((s) => [s.studentId, s.fullName]));

  const all = day.data ?? [];
  const rows = status ? all.filter((row) => row.status === status) : all;

  const tone = (s: AttendanceStatus) =>
    s === 'PRESENT' ? 'success' : s === 'ABSENT' ? 'danger' : s === 'LATE' ? 'warning' : 'neutral';

  if (options.length === 0 && !classes.isLoading) {
    return (
      <div className="mt-6">
        <p className="text-sm text-ink-3">No classes exist yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Class" htmlFor="admin-list-class">
          <Select
            id="admin-list-class"
            value={selectedClassId}
            onChange={(e) => setClassId(e.target.value)}
          >
            {classes.isLoading && <option value="">Loading classes…</option>}
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Date" htmlFor="admin-list-date">
          <Input
            id="admin-list-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>

        <Field label="Status" htmlFor="admin-list-status">
          <Select
            id="admin-list-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as AttendanceStatus | '')}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
        <div className="overflow-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line/10">
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Student</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Status</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Marked by</th>
                <th className="hidden px-3 py-2 text-xs font-medium text-ink-3 md:table-cell">
                  Remark
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/5">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-sm text-ink-3">
                    {day.isLoading
                      ? 'Loading\u2026'
                      : `No attendance marked for ${date}${status ? ` with status ${status}` : ''}`}
                  </td>
                </tr>
              )}
              {rows.map((row: AttendanceResponseDto) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-3">
                  <td className="max-w-40 truncate px-3 py-2 text-sm text-ink-2">
                    {nameById.get(row.studentId) ?? 'Unknown student'}
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone={tone(row.status)}>{row.status}</Badge>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-ink-3">
                    {row.markedBy.slice(0, 8)}
                  </td>
                  <td className="hidden max-w-48 truncate px-3 py-2 text-sm text-ink-2 md:table-cell">
                    {row.remark ?? '\u2014'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {day.isError && <p className="mt-3 text-sm text-danger">{(day.error as Error)?.message}</p>}
    </div>
  );
}
