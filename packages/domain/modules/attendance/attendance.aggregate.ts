import { BadRequestError } from '../../../../apps/api/errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import { DeleteInfoVO, type Id, Quantity, type Reason } from '../../value-objects';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

const STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

type CreateAttendanceProps = {
  id: Id;
  schoolId: Id;
  studentId: Id;
  classId: Id;
  subjectId: Id | null;
  periodId: Id | null;
  /** Normalized to UTC midnight. */
  date: Date;
  status: AttendanceStatus;
  remark: string | null;
  markedBy: Id;
};

export class AttendanceAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private readonly _schoolId: Id,
    private readonly _studentId: Id,
    private readonly _classId: Id,
    private readonly _subjectId: Id | null,
    private readonly _periodId: Id | null,
    private readonly _date: Date,
    private _status: AttendanceStatus,
    private _remark: string | null,
    private _markedBy: Id,
    private _deleted: DeleteInfoVO,
    private _version: Quantity,
  ) {
    super();
  }

  get id() {
    return this._id;
  }
  get schoolId() {
    return this._schoolId;
  }
  get studentId() {
    return this._studentId;
  }
  get classId() {
    return this._classId;
  }
  get subjectId() {
    return this._subjectId;
  }
  get periodId() {
    return this._periodId;
  }
  get date() {
    return this._date;
  }
  get status() {
    return this._status;
  }
  get remark() {
    return this._remark;
  }
  get markedBy() {
    return this._markedBy;
  }
  get deleted() {
    return this._deleted;
  }
  get version() {
    return this._version;
  }
  get isDeleted(): boolean {
    return this._deleted.isDeleted;
  }

  /** Normalize a date to UTC midnight for consistent day-key storage. */
  static normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setUTCHours(0, 0, 0, 0);
    return normalized;
  }

  static create(props: CreateAttendanceProps): AttendanceAggregate {
    if (!STATUSES.includes(props.status)) {
      throw new BadRequestError('Attendance status is not supported.');
    }
    if (props.date.getTime() > Date.now()) {
      throw new BadRequestError('Attendance cannot be marked for a future date.');
    }

    const attendance = new AttendanceAggregate(
      props.id,
      props.schoolId,
      props.studentId,
      props.classId,
      props.subjectId,
      props.periodId,
      AttendanceAggregate.normalizeDate(props.date),
      props.status,
      props.remark?.trim() || null,
      props.markedBy,
      DeleteInfoVO.none(),
      Quantity.zero(),
    );
    return attendance;
  }

  static rehydrate(
    id: Id,
    schoolId: Id,
    studentId: Id,
    classId: Id,
    subjectId: Id | null,
    periodId: Id | null,
    date: Date,
    status: AttendanceStatus,
    remark: string | null,
    markedBy: Id,
    deleted: DeleteInfoVO,
    version: Quantity,
  ): AttendanceAggregate {
    return new AttendanceAggregate(
      id,
      schoolId,
      studentId,
      classId,
      subjectId,
      periodId,
      date,
      status,
      remark,
      markedBy,
      deleted,
      version,
    );
  }

  /** Re-mark attendance (corrections). Updates status, remark and marker. */
  updateStatus(status: AttendanceStatus, remark: string | null, markedBy: Id): void {
    if (!STATUSES.includes(status)) {
      throw new BadRequestError('Attendance status is not supported.');
    }
    this._status = status;
    this._remark = remark?.trim() || null;
    this._markedBy = markedBy;
  }

  delete(actor: Id, reason: Reason): void {
    if (this._deleted.isDeleted) {
      throw new BadRequestError('This attendance record has already been deleted.');
    }
    this._deleted = DeleteInfoVO.create(actor, reason);
  }
}
