import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class AssignmentDeletedEvent implements IEvent<{ assignmentId: Id }> {
  readonly type = 'assignment.deleted';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { assignmentId: Id }) {}
}
