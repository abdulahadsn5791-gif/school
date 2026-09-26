import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class GuardianRecoveredEvent implements IEvent<{ guardianId: Id }> {
  readonly type = 'guardian.recovered';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { guardianId: Id }) {}
}
