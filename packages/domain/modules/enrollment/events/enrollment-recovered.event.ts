import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class EnrollmentRecoveredEvent implements IEvent<{ enrollmentId: Id }> {
  readonly type = 'enrollment.recovered';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { enrollmentId: Id }) {}
}
