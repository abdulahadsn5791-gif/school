import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class EnrollmentRollAssignedEvent
  implements IEvent<{ enrollmentId: Id; rollNumber: string }>
{
  readonly type = 'enrollment.roll-assigned';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { enrollmentId: Id; rollNumber: string }) {}
}
