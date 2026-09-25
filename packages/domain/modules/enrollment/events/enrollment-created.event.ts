import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class EnrollmentCreatedEvent implements IEvent<{ enrollmentId: Id; studentId: Id }> {
  readonly type = 'enrollment.created';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { enrollmentId: Id; studentId: Id }) {}
}
