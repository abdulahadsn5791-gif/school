import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class CalendarEventRescheduledEvent implements IEvent<{ eventId: Id }> {
  readonly type = 'calendar-event.rescheduled';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { eventId: Id }) {}
}
