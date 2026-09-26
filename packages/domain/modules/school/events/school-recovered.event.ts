import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class SchoolRecoveredEvent implements IEvent<{ schoolId: Id }> {
  readonly type = 'school.recovered';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { schoolId: Id }) {}
}
