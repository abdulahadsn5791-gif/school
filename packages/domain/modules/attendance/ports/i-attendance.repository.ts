import type { Id } from '../../../value-objects';
import type { AttendanceAggregate } from '../attendance.aggregate';

export interface IAttendanceRepository {
  FindById(id: Id): Promise<AttendanceAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<AttendanceAggregate>;
  /** Live attendance of one student between two dates (UTC-midnight keys). */
  FindByStudentAndDateRange(
    studentId: Id,
    fromDate: Date,
    toDate: Date,
  ): Promise<AttendanceAggregate[]>;
  /** Live attendance of one class on one day (UTC-midnight key). */
  FindByClassAndDate(classId: Id, date: Date): Promise<AttendanceAggregate[]>;
  /** Live record for one student on one day (optionally one period), if any. */
  FindByStudentAndDate(
    studentId: Id,
    date: Date,
    periodId?: Id,
  ): Promise<AttendanceAggregate | null>;
  Save(attendance: AttendanceAggregate): Promise<void>;
  Create(attendance: AttendanceAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
}
