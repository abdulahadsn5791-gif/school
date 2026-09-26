'use client';

import {
  ATTENDANCE_STATUSES,
  useGetClassDayAttendance,
  useGetClassRoster,
  useTeacherContext,
  useTeacherRegister,
} from '@ecomerece/frontend';
import type { AttendanceResponseDto, AttendanceStatus } from '@ecomerece/shared';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Select,
  Spinner,
} from '@ecomerece/ui';
import { CalendarCheck, CheckCheck, ClipboardCheck } from 'lucide-react';
import { useState } from 'react';

const STATUS_TONE: Record<AttendanceStatus, 'success' | 'danger' | 'warning' | 'neutral'> = {
  PRESENT: 'success',
  ABSENT: 'danger',
  LATE: 'warning',
  EXCUSED: 'neutral',
};

/** Local calendar day, so the register opens on the teacher's today rather than UTC's. */
function todayIso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export default function TeacherAttendancePage() {
  const { classes, hasClasses, isLoading: classesLoading, schoolId } = useTeacherContext();
  const [view, setView] = useState<'register' | 'history'>('register');
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(todayIso);

  const selectedClassId = classId || classes[0]?.id || '';

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
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Attendance</h1>
          <p className="mt-1 text-sm text-ink-3">
            Mark a daily register for your classes, or review past records.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'register' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setView('register')}
          >
            Mark register
          </Button>
          <Button
            variant={view === 'history' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setView('history')}
          >
            Records
          </Button>
        </div>
      </header>

      {!hasClasses && (
        <div className="mt-6">
          <EmptyState
            icon={ClipboardCheck}
            title="No classes assigned yet"
            description="You are not the class teacher of any class, so there is no register to mark. An administrator needs to assign you first."
          />
        </div>
      )}

      {hasClasses && view === 'register' && (
        <div className="mt-6">
          {!schoolId && (
            <p className="mb-4 rounded-2xl bg-surface-2 px-4 py-3 text-sm text-ink-2">
              A school could not be resolved for your classes, so saving is disabled.
            </p>
          )}
          <Register
            classes={classes.map((clazz) => ({ id: clazz.id, name: clazz.name }))}
            classId={selectedClassId}
            onClassChange={setClassId}
            date={date}
            onDateChange={setDate}
          />
        </div>
      )}

      {hasClasses && view === 'history' && (
        <div className="mt-6">
          <History
            classes={classes.map((clazz) => ({ id: clazz.id, name: clazz.name }))}
            classId={selectedClassId}
            onClassChange={setClassId}
            date={date}
            onDateChange={setDate}
          />
        </div>
      )}
    </div>
  );
}

function Register({
  classes,
  classId,
  onClassChange,
  date,
  onDateChange,
}: {
  classes: Array<{ id: string; name: string }>;
  classId: string;
  onClassChange: (id: string) => void;
  date: string;
  onDateChange: (date: string) => void;
}) {
  const {
    entries,
    isLoading,
    isError,
    error,
    isAlreadyMarked,
    setStatus,
    setRemark,
    applyToAll,
    counts,
    submit,
    isSaving,
    saveError,
    isSaved,
    savedCount,
    canSubmit,
  } = useTeacherRegister(classId, date);

  if (isLoading) {
    return (
      <Card padding="lg" className="flex items-center gap-3">
        <Spinner />
        <span className="text-sm text-ink-3">Loading register…</span>
      </Card>
    );
  }

  if (isError) {
    return <ErrorState title="Could not load the register" description={error?.message} />;
  }

  return (
    <>
      <Card padding="lg">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Class" htmlFor="register-class">
            <Select
              id="register-class"
              value={classId}
              onChange={(e) => onClassChange(e.target.value)}
            >
              {classes.map((clazz) => (
                <option key={clazz.id} value={clazz.id}>
                  {clazz.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date" htmlFor="register-date">
            <Input
              id="register-date"
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </Field>
        </div>

        {entries.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line/10 pt-4">
            <span className="text-sm text-ink-3">Set everyone to</span>
            {ATTENDANCE_STATUSES.map((status) => (
              <Button key={status} variant="secondary" size="sm" onClick={() => applyToAll(status)}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>
        )}
      </Card>

      {entries.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={CalendarCheck}
            title="No students enrolled"
            description="This class has no enrolled students, so there is nothing to mark."
          />
        </div>
      ) : (
        <>
          {isAlreadyMarked && (
            <p className="mt-4 rounded-2xl bg-surface-2 px-4 py-3 text-sm text-ink-2">
              This class already has attendance for {date}. Saving updates those records.
            </p>
          )}

          <div className="mt-4 overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
            <div className="overflow-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-line/10">
                    <th className="px-3 py-2 text-xs font-medium text-ink-3">Roll</th>
                    <th className="px-3 py-2 text-xs font-medium text-ink-3">Student</th>
                    <th className="px-3 py-2 text-xs font-medium text-ink-3">Status</th>
                    <th className="px-3 py-2 text-xs font-medium text-ink-3">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/5">
                  {entries.map((entry) => (
                    <tr key={entry.studentId} className="transition-colors hover:bg-surface-3">
                      <td className="px-3 py-2 font-mono text-xs text-ink-3">
                        {entry.rollNumber ?? '—'}
                      </td>
                      <td className="px-3 py-2 text-sm text-ink-2">{entry.fullName}</td>
                      <td className="px-3 py-2">
                        <div className="w-36">
                          <Select
                            aria-label={`Status for ${entry.fullName}`}
                            value={entry.status}
                            onChange={(e) =>
                              setStatus(entry.studentId, e.target.value as AttendanceStatus)
                            }
                          >
                            {ATTENDANCE_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          aria-label={`Remark for ${entry.fullName}`}
                          value={entry.remark}
                          placeholder="Optional"
                          maxLength={300}
                          onChange={(e) => setRemark(entry.studentId, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant="primary" isLoading={isSaving} disabled={!canSubmit} onClick={submit}>
              <CheckCheck className="size-4" /> Save register
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={STATUS_TONE.PRESENT}>Present {counts.PRESENT}</Badge>
              <Badge tone={STATUS_TONE.ABSENT}>Absent {counts.ABSENT}</Badge>
              <Badge tone={STATUS_TONE.LATE}>Late {counts.LATE}</Badge>
              <Badge tone={STATUS_TONE.EXCUSED}>Excused {counts.EXCUSED}</Badge>
            </div>
          </div>

          {saveError && <p className="mt-3 text-sm text-danger">{saveError.message}</p>}
          {isSaved && (
            <p className="mt-3 text-sm text-ink-2">
              Saved {savedCount} {savedCount === 1 ? 'record' : 'records'}.
            </p>
          )}
        </>
      )}
    </>
  );
}

function History({
  classes,
  classId,
  onClassChange,
  date,
  onDateChange,
}: {
  classes: Array<{ id: string; name: string }>;
  classId: string;
  onClassChange: (id: string) => void;
  date: string;
  onDateChange: (date: string) => void;
}) {
  // The API exposes attendance per class and day, not as a browsable list, so this
  // view is a read-only mirror of the register for a chosen date.
  const day = useGetClassDayAttendance(classId, date);
  const roster = useGetClassRoster(classId);
  const nameById = new Map((roster.data ?? []).map((s) => [s.studentId, s.fullName]));
  const rows = day.data ?? [];

  return (
    <>
      <Card padding="lg">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Class" htmlFor="history-class">
            <Select
              id="history-class"
              value={classId}
              onChange={(e) => onClassChange(e.target.value)}
            >
              {classes.map((clazz) => (
                <option key={clazz.id} value={clazz.id}>
                  {clazz.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date" htmlFor="history-date">
            <Input
              id="history-date"
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </Field>
        </div>
      </Card>

      {day.isError && <p className="mt-3 text-sm text-danger">{(day.error as Error)?.message}</p>}

      <div className="mt-4 overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
        <div className="overflow-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line/10">
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Roll</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Student</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Status</th>
                <th className="px-3 py-2 text-xs font-medium text-ink-3">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/5">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-sm text-ink-3">
                    {day.isLoading ? 'Loading\u2026' : `No attendance marked for ${date}`}
                  </td>
                </tr>
              )}
              {rows.map((row: AttendanceResponseDto) => {
                const student = roster.data?.find((s) => s.studentId === row.studentId);
                return (
                  <tr key={row.id} className="transition-colors hover:bg-surface-3">
                    <td className="px-3 py-2 font-mono text-xs text-ink-3">
                      {student?.rollNumber ?? '\u2014'}
                    </td>
                    <td className="px-3 py-2 text-sm text-ink-2">
                      {nameById.get(row.studentId) ?? 'Unknown student'}
                    </td>
                    <td className="px-3 py-2">
                      <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>
                    </td>
                    <td className="max-w-48 truncate px-3 py-2 text-sm text-ink-2">
                      {row.remark ?? '\u2014'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
