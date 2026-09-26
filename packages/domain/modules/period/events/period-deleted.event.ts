import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class PeriodDeletedEvent implements IEvent<{ periodId: Id }> {
  readonly type = 'period.deleted';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { periodId: Id }) {}
}
