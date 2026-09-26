import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class LeaveRejectedEvent implements IEvent<{ leaveId: Id }> {
  readonly type = 'leave.rejected';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { leaveId: Id }) {}
}
