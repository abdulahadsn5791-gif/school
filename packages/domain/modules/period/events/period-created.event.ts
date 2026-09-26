import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class PeriodCreatedEvent implements IEvent<{ periodId: Id; schoolId: Id }> {
  readonly type = 'period.created';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { periodId: Id; schoolId: Id }) {}
}
