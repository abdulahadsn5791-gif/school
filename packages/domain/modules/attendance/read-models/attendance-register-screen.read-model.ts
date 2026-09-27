import type { AttendanceReadModel } from './attendance.read-model';

/**
 * `GET /attendance/register` — the attendance register screen (new.md §6):
 * the class's students (roll number + name) each pre-filled with any record
 * the API already holds for the chosen day. One request replaces the roster +
 * day-records client join in the teacher register hook and history view.
 */
export interface AttendanceRegisterScreenReadModel {
  classId: string;
  date: Date;
  isAlreadyMarked: boolean;
  rows: Array<{
    studentId: string;
    fullName: string;
    rollNumber: string | null;
    /** Existing live record for this student/day, if any. */
    record: Pick<AttendanceReadModel, 'id' | 'status' | 'remark'> | null;
  }>;
}
