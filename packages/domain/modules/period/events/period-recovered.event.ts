import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class PeriodRecoveredEvent implements IEvent<{ periodId: Id }> {
  readonly type = 'period.recovered';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { periodId: Id }) {}
}
