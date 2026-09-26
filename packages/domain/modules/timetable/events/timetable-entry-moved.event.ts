import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class TimetableEntryMovedEvent implements IEvent<{ entryId: Id }> {
  readonly type = 'timetable.entry-moved';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { entryId: Id }) {}
}
