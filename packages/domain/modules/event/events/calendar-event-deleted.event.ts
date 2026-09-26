import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class CalendarEventDeletedEvent implements IEvent<{ eventId: Id }> {
  readonly type = 'calendar-event.deleted';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { eventId: Id }) {}
}
