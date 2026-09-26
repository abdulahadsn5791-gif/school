import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class AssignmentUpdatedEvent implements IEvent<{ assignmentId: Id }> {
  readonly type = 'assignment.updated';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { assignmentId: Id }) {}
}
