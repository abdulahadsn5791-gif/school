import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class StudentTestCreatedEvent implements IEvent<{ submissionId: Id; assignmentId: Id }> {
  readonly type = 'student-test.created';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { submissionId: Id; assignmentId: Id }) {}
}
