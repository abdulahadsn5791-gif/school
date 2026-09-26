import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class AssignmentCreatedEvent implements IEvent<{ assignmentId: Id; classId: Id }> {
  readonly type = 'assignment.created';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { assignmentId: Id; classId: Id }) {}
}
