import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class SubjectRenamedEvent implements IEvent<{ subjectId: Id }> {
  readonly type = 'subject.renamed';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { subjectId: Id }) {}
}
