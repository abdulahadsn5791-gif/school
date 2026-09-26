import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class LeaveSubmittedEvent implements IEvent<{ leaveId: Id; applicantId: Id }> {
  readonly type = 'leave.submitted';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { leaveId: Id; applicantId: Id }) {}
}
