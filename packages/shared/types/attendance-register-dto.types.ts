import type { AttendanceStatus } from '../request-dtos/attendance/mark-attendance.dto';

/**
 * `GET /attendance/register` — one prefilled row of the attendance register
 * screen (new.md §6). Mirrors AttendanceRegisterScreenReadModel.
 */
export interface AttendanceRegisterRowDto {
  studentId: string;
  fullName: string;
  rollNumber: string | null;
  /** Existing live record for this student/day, if any. */
  record: { id: string; status: AttendanceStatus; remark: string | null } | null;
}

export interface AttendanceRegisterScreenDto {
  classId: string;
  date: Date;
  isAlreadyMarked: boolean;
  rows: AttendanceRegisterRowDto[];
}
