import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class LeaveApprovedEvent implements IEvent<{ leaveId: Id }> {
  readonly type = 'leave.approved';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { leaveId: Id }) {}
}
