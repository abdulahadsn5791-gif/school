import type { AttendanceResponseDto, AttendanceStatus } from '@ecomerece/shared';
import { useCallback, useMemo, useState } from 'react';
import { useGetClassDayAttendance, useMarkAttendance } from '../attendance';
import { useGetClassRoster } from '../enrollment';
import { useTeacherContext } from './use-teacher-context';

export const ATTENDANCE_STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

export interface RegisterEntry {
  studentId: string;
  fullName: string;
  rollNumber: string | null;
  status: AttendanceStatus;
  remark: string;
}

/** Only the fields the teacher has touched — merged over the prefilled row. */
interface RegisterOverride {
  status?: AttendanceStatus;
  remark?: string;
}

export interface TeacherRegister {
  entries: RegisterEntry[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  /** True when the API already holds records for this class/day, so saving re-marks them. */
  isAlreadyMarked: boolean;
  setStatus: (studentId: string, status: AttendanceStatus) => void;
  setRemark: (studentId: string, remark: string) => void;
  applyToAll: (status: AttendanceStatus) => void;
  counts: Record<AttendanceStatus, number>;
  submit: () => void;
  isSaving: boolean;
  saveError: Error | null;
  isSaved: boolean;
  savedCount: number | null;
  canSubmit: boolean;
}

/**
 * The attendance register for one class on one day.
 *
 * Rows are prefilled from any records the API already holds for that day, because
 * marking is idempotent server-side: re-saving a day updates the existing rows
 * rather than tripping the unique index.
 */
export function useTeacherRegister(classId: string, date: string): TeacherRegister {
  const { schoolId } = useTeacherContext();
  const roster = useGetClassRoster(classId);
  const existing = useGetClassDayAttendance(classId, date);
  const markAttendance = useMarkAttendance();

  const [overrides, setOverrides] = useState<Record<string, RegisterOverride>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Unsaved edits belong to one class/day pair. Switching either one must not carry
  // the previous statuses and remarks over, so the edits are dropped during render
  // rather than in an effect that would render stale rows for one frame.
  const scopeKey = `${classId}:${date}`;
  const [lastScopeKey, setLastScopeKey] = useState(scopeKey);
  if (lastScopeKey !== scopeKey) {
    setLastScopeKey(scopeKey);
    setOverrides({});
    setIsSaved(false);
  }

  const students = roster.data ?? [];

  const existingByStudent = useMemo(() => {
    const map = new Map<string, AttendanceResponseDto>();
    for (const record of existing.data ?? []) map.set(record.studentId, record);
    return map;
  }, [existing.data]);

  const entries = useMemo<RegisterEntry[]>(
    () =>
      students.map((student) => {
        const prior = existingByStudent.get(student.studentId);
        const override = overrides[student.studentId];
        return {
          studentId: student.studentId,
          fullName: student.fullName,
          rollNumber: student.rollNumber,
          status: override?.status ?? prior?.status ?? 'PRESENT',
          remark: override?.remark ?? prior?.remark ?? '',
        };
      }),
    [students, overrides, existingByStudent],
  );

  const patch = useCallback((studentId: string, next: RegisterOverride) => {
    setIsSaved(false);
    setOverrides((prev) => ({ ...prev, [studentId]: { ...prev[studentId], ...next } }));
  }, []);

  const setStatus = useCallback(
    (studentId: string, status: AttendanceStatus) => patch(studentId, { status }),
    [patch],
  );

  const setRemark = useCallback(
    (studentId: string, remark: string) => patch(studentId, { remark }),
    [patch],
  );

  // Applies to every enrolled student, not just the rows already touched.
  const applyToAll = useCallback(
    (status: AttendanceStatus) => {
      setIsSaved(false);
      setOverrides((prev) => {
        const next = { ...prev };
        for (const student of students)
          next[student.studentId] = { ...next[student.studentId], status };
        return next;
      });
    },
    [students],
  );

  const counts = useMemo(() => {
    const tally: Record<AttendanceStatus, number> = {
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      EXCUSED: 0,
    };
    for (const entry of entries) tally[entry.status] += 1;
    return tally;
  }, [entries]);

  const submit = useCallback(() => {
    if (!schoolId || entries.length === 0) return;
    markAttendance.mutate(
      {
        schoolId,
        classId,
        date: new Date(date),
        entries: entries.map((entry) => {
          const remark = entry.remark.trim();
          return {
            studentId: entry.studentId,
            status: entry.status,
            remark: remark ? remark : null,
          };
        }),
      },
      { onSuccess: () => setIsSaved(true) },
    );
  }, [schoolId, classId, date, entries, markAttendance]);

  return {
    entries,
    isLoading: roster.isLoading || existing.isLoading,
    isError: roster.isError || existing.isError,
    error: (roster.error as Error | null) ?? (existing.error as Error | null),
    isAlreadyMarked: (existing.data?.length ?? 0) > 0,
    setStatus,
    setRemark,
    applyToAll,
    counts,
    submit,
    isSaving: markAttendance.isPending,
    saveError: (markAttendance.error as Error | null) ?? null,
    isSaved,
    savedCount: markAttendance.isSuccess ? (markAttendance.data?.length ?? 0) : null,
    canSubmit: Boolean(schoolId) && entries.length > 0 && !markAttendance.isPending,
  };
}
