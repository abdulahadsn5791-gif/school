import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class StudentTestSubmittedEvent implements IEvent<{ submissionId: Id }> {
  readonly type = 'student-test.submitted';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { submissionId: Id }) {}
}
