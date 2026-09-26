import { BadRequestError } from '../../../../apps/api/errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import { DeleteInfoVO, type Id, Quantity, type Reason, Title } from '../../value-objects';
import { CalendarEventCreatedEvent } from './events/calendar-event-created.event';
import { CalendarEventDeletedEvent } from './events/calendar-event-deleted.event';
import { CalendarEventRecoveredEvent } from './events/calendar-event-recovered.event';
import { CalendarEventRescheduledEvent } from './events/calendar-event-rescheduled.event';

export type CalendarEventType = 'HOLIDAY' | 'EXAM' | 'MEETING' | 'ACTIVITY' | 'OTHER';

const EVENT_TYPES: CalendarEventType[] = ['HOLIDAY', 'EXAM', 'MEETING', 'ACTIVITY', 'OTHER'];

type CreateCalendarEventProps = {
  id: Id;
  schoolId: Id;
  title: string;
  description: string | null;
  type: CalendarEventType;
  startDate: Date;
  endDate: Date;
  classId: Id | null;
};

export class CalendarEventAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private readonly _schoolId: Id,
    private _title: Title,
    private _description: string | null,
    private _type: CalendarEventType,
    private _startDate: Date,
    private _endDate: Date,
    private readonly _classId: Id | null,
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

  get title() {
    return this._title;
  }

  get description() {
    return this._description;
  }

  get type() {
    return this._type;
  }

  get startDate() {
    return this._startDate;
  }

  get endDate() {
    return this._endDate;
  }

  get classId() {
    return this._classId;
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

  static create(props: CreateCalendarEventProps): CalendarEventAggregate {
    if (!EVENT_TYPES.includes(props.type)) {
      throw new BadRequestError('Event type is not supported.');
    }
    if (props.endDate.getTime() < props.startDate.getTime()) {
      throw new BadRequestError('Event end date cannot be before the start date.');
    }

    const event = new CalendarEventAggregate(
      props.id,
      props.schoolId,
      Title.create(props.title),
      props.description?.trim() || null,
      props.type,
      props.startDate,
      props.endDate,
      props.classId,
      DeleteInfoVO.none(),
      Quantity.zero(),
    );
    event.raise(new CalendarEventCreatedEvent({ eventId: event._id, schoolId: props.schoolId }));
    return event;
  }

  static rehydrate(
    id: Id,
    schoolId: Id,
    title: string,
    description: string | null,
    type: CalendarEventType,
    startDate: Date,
    endDate: Date,
    classId: Id | null,
    deleted: DeleteInfoVO,
    version: Quantity,
  ): CalendarEventAggregate {
    return new CalendarEventAggregate(
      id,
      schoolId,
      Title.rehydrate(title),
      description,
      type,
      startDate,
      endDate,
      classId,
      deleted,
      version,
    );
  }

  updateDetails(
    title: string | undefined,
    description: string | null | undefined,
    type: CalendarEventType | undefined,
  ): void {
    if (title !== undefined && title !== this._title.value) {
      this._title = Title.create(title);
    }
    if (description !== undefined) this._description = description?.trim() || null;
    if (type !== undefined) {
      if (!EVENT_TYPES.includes(type)) {
        throw new BadRequestError('Event type is not supported.');
      }
      this._type = type;
    }
  }

  /** classId === null means the whole school. */
  reschedule(startDate: Date, endDate: Date): void {
    if (endDate.getTime() < startDate.getTime()) {
      throw new BadRequestError('Event end date cannot be before the start date.');
    }
    if (
      startDate.getTime() === this._startDate.getTime() &&
      endDate.getTime() === this._endDate.getTime()
    ) {
      return;
    }
    this._startDate = startDate;
    this._endDate = endDate;
    this.raise(new CalendarEventRescheduledEvent({ eventId: this._id }));
  }

  delete(actor: Id, reason: Reason): void {
    if (this._deleted.isDeleted) {
      throw new BadRequestError('This event has already been deleted.');
    }
    this._deleted = DeleteInfoVO.create(actor, reason);
    this.raise(new CalendarEventDeletedEvent({ eventId: this._id }));
  }

  recover(): void {
    if (!this._deleted.isDeleted) return;
    this._deleted = DeleteInfoVO.none();
    this.raise(new CalendarEventRecoveredEvent({ eventId: this._id }));
  }
}
