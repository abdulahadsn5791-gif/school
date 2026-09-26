import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class LeaveDeletedEvent implements IEvent<{ leaveId: Id }> {
  readonly type = 'leave.deleted';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { leaveId: Id }) {}
}
