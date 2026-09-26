import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class SubjectDeletedEvent implements IEvent<{ subjectId: Id }> {
  readonly type = 'subject.deleted';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { subjectId: Id }) {}
}
