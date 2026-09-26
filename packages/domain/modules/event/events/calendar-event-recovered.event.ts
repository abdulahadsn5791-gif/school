import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class CalendarEventRecoveredEvent implements IEvent<{ eventId: Id }> {
  readonly type = 'calendar-event.recovered';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { eventId: Id }) {}
}
