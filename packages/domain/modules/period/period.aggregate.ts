import { BadRequestError } from '../../../../apps/api/errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import { DeleteInfoVO, type Id, Quantity, type Reason, Title } from '../../value-objects';
import { PeriodCreatedEvent } from './events/period-created.event';
import { PeriodDeletedEvent } from './events/period-deleted.event';
import { PeriodRecoveredEvent } from './events/period-recovered.event';
import { PeriodTimesChangedEvent } from './events/period-times-changed.event';

type CreatePeriodProps = {
  id: Id;
  schoolId: Id;
  name: string;
  startTime: string;
  endTime: string;
  order: number;
};

/** Accepts "08:00", "08:00 AM", "08:00:00 PM" style clock times. */
const CLOCK_TIME = /^\d{1,2}:\d{2}(:\d{2})?\s?(AM|PM)?$/i;

export class PeriodAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private readonly _schoolId: Id,
    private _name: Title,
    private _startTime: string,
    private _endTime: string,
    private readonly _order: number,
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

  get name() {
    return this._name;
  }

  get startTime() {
    return this._startTime;
  }

  get endTime() {
    return this._endTime;
  }

  get order() {
    return this._order;
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

  static create(props: CreatePeriodProps): PeriodAggregate {
    if (!Number.isInteger(props.order) || props.order < 1 || props.order > 20) {
      throw new BadRequestError('Period order must be an integer between 1 and 20.');
    }
    if (!CLOCK_TIME.test(props.startTime.trim())) {
      throw new BadRequestError('Period start time must look like 08:00 or 08:00 AM.');
    }
    if (!CLOCK_TIME.test(props.endTime.trim())) {
      throw new BadRequestError('Period end time must look like 08:45 or 08:45 AM.');
    }

    const period = new PeriodAggregate(
      props.id,
      props.schoolId,
      Title.create(props.name),
      props.startTime.trim(),
      props.endTime.trim(),
      props.order,
      DeleteInfoVO.none(),
      Quantity.zero(),
    );
    period.raise(new PeriodCreatedEvent({ periodId: period._id, schoolId: props.schoolId }));
    return period;
  }

  static rehydrate(
    id: Id,
    schoolId: Id,
    name: string,
    startTime: string,
    endTime: string,
    order: number,
    deleted: DeleteInfoVO,
    version: Quantity,
  ): PeriodAggregate {
    return new PeriodAggregate(
      id,
      schoolId,
      Title.rehydrate(name),
      startTime,
      endTime,
      order,
      deleted,
      version,
    );
  }

  rename(name: string): void {
    if (this._name.value === name) return;
    this._name = Title.create(name);
  }

  changeTimes(startTime: string, endTime: string): void {
    const start = startTime.trim();
    const end = endTime.trim();
    if (!CLOCK_TIME.test(start)) {
      throw new BadRequestError('Period start time must look like 08:00 or 08:00 AM.');
    }
    if (!CLOCK_TIME.test(end)) {
      throw new BadRequestError('Period end time must look like 08:45 or 08:45 AM.');
    }
    if (start === this._startTime && end === this._endTime) return;
    this._startTime = start;
    this._endTime = end;
    this.raise(new PeriodTimesChangedEvent({ periodId: this._id }));
  }

  delete(actor: Id, reason: Reason): void {
    if (this._deleted.isDeleted) {
      throw new BadRequestError('This period has already been deleted.');
    }
    this._deleted = DeleteInfoVO.create(actor, reason);
    this.raise(new PeriodDeletedEvent({ periodId: this._id }));
  }

  recover(): void {
    if (!this._deleted.isDeleted) return;
    this._deleted = DeleteInfoVO.none();
    this.raise(new PeriodRecoveredEvent({ periodId: this._id }));
  }
}
