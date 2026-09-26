import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class CalendarEventCreatedEvent implements IEvent<{ eventId: Id; schoolId: Id }> {
  readonly type = 'calendar-event.created';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { eventId: Id; schoolId: Id }) {}
}
