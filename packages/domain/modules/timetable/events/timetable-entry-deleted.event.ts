import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class TimetableEntryDeletedEvent implements IEvent<{ entryId: Id }> {
  readonly type = 'timetable.entry-deleted';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { entryId: Id }) {}
}
