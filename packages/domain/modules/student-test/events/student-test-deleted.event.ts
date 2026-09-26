import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class StudentTestDeletedEvent implements IEvent<{ submissionId: Id }> {
  readonly type = 'student-test.deleted';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { submissionId: Id }) {}
}
