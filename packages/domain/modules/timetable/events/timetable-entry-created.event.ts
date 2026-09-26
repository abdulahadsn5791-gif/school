import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class TimetableEntryCreatedEvent implements IEvent<{ entryId: Id; classId: Id }> {
  readonly type = 'timetable.entry-created';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { entryId: Id; classId: Id }) {}
}
