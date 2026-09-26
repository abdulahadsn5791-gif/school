import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class StudentTestGradedEvent implements IEvent<{ submissionId: Id }> {
  readonly type = 'student-test.graded';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { submissionId: Id }) {}
}
