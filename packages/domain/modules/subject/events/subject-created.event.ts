import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class SubjectCreatedEvent implements IEvent<{ subjectId: Id; schoolId: Id }> {
  readonly type = 'subject.created';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { subjectId: Id; schoolId: Id }) {}
}
