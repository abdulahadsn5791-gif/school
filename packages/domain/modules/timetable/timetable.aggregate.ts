import { BadRequestError } from '../../../../apps/api/errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import { DeleteInfoVO, type Id, Quantity, type Reason } from '../../value-objects';
import { TimetableEntryCreatedEvent } from './events/timetable-entry-created.event';
import { TimetableEntryDeletedEvent } from './events/timetable-entry-deleted.event';
import { TimetableEntryMovedEvent } from './events/timetable-entry-moved.event';
import { TimetableEntryRecoveredEvent } from './events/timetable-entry-recovered.event';

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const YEAR_RE = /^\d{4}-\d{4}$/;

type CreateTimetableEntryProps = {
  id: Id;
  schoolId: Id;
  academicYear: string;
  classId: Id;
  subjectId: Id;
  teacherId: Id;
  periodId: Id;
  dayOfWeek: DayOfWeek;
};

export class TimetableEntryAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private readonly _schoolId: Id,
    private readonly _academicYear: string,
    private readonly _classId: Id,
    private _subjectId: Id,
    private _teacherId: Id,
    private _periodId: Id,
    private _dayOfWeek: DayOfWeek,
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

  get academicYear() {
    return this._academicYear;
  }

  get classId() {
    return this._classId;
  }

  get subjectId() {
    return this._subjectId;
  }

  get teacherId() {
    return this._teacherId;
  }

  get periodId() {
    return this._periodId;
  }

  get dayOfWeek() {
    return this._dayOfWeek;
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

  static create(props: CreateTimetableEntryProps): TimetableEntryAggregate {
    if (!YEAR_RE.test(props.academicYear)) {
      throw new BadRequestError('Academic year must look like 2026-2027.');
    }
    if (!DAYS.includes(props.dayOfWeek)) {
      throw new BadRequestError('Day of week is not supported.');
    }

    const entry = new TimetableEntryAggregate(
      props.id,
      props.schoolId,
      props.academicYear,
      props.classId,
      props.subjectId,
      props.teacherId,
      props.periodId,
      props.dayOfWeek,
      DeleteInfoVO.none(),
      Quantity.zero(),
    );
    entry.raise(new TimetableEntryCreatedEvent({ entryId: entry._id, classId: props.classId }));
    return entry;
  }

  static rehydrate(
    id: Id,
    schoolId: Id,
    academicYear: string,
    classId: Id,
    subjectId: Id,
    teacherId: Id,
    periodId: Id,
    dayOfWeek: DayOfWeek,
    deleted: DeleteInfoVO,
    version: Quantity,
  ): TimetableEntryAggregate {
    return new TimetableEntryAggregate(
      id,
      schoolId,
      academicYear,
      classId,
      subjectId,
      teacherId,
      periodId,
      dayOfWeek,
      deleted,
      version,
    );
  }

  /** Move to another day/period. Slot uniqueness is enforced by the repo + schema indexes. */
  moveTo(dayOfWeek: DayOfWeek, periodId: Id): void {
    if (!DAYS.includes(dayOfWeek)) {
      throw new BadRequestError('Day of week is not supported.');
    }
    if (dayOfWeek === this._dayOfWeek && this._periodId.equals(periodId)) return;
    this._dayOfWeek = dayOfWeek;
    this._periodId = periodId;
    this.raise(new TimetableEntryMovedEvent({ entryId: this._id }));
  }

  reassign(subjectId: Id, teacherId: Id): void {
    const unchanged = this._subjectId.equals(subjectId) && this._teacherId.equals(teacherId);
    if (unchanged) return;
    this._subjectId = subjectId;
    this._teacherId = teacherId;
    this.raise(new TimetableEntryMovedEvent({ entryId: this._id }));
  }

  delete(actor: Id, reason: Reason): void {
    if (this._deleted.isDeleted) {
      throw new BadRequestError('This timetable entry has already been deleted.');
    }
    this._deleted = DeleteInfoVO.create(actor, reason);
    this.raise(new TimetableEntryDeletedEvent({ entryId: this._id }));
  }

  recover(): void {
    if (!this._deleted.isDeleted) return;
    this._deleted = DeleteInfoVO.none();
    this.raise(new TimetableEntryRecoveredEvent({ entryId: this._id }));
  }
}
