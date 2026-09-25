import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class EnrollmentDeletedEvent implements IEvent<{ enrollmentId: Id }> {
  readonly type = 'enrollment.deleted';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { enrollmentId: Id }) {}
}
