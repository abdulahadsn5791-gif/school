import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class AcademicTermDeletedEvent implements IEvent<{ termId: Id }> {
  readonly type = 'academic-term.deleted';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { termId: Id }) {}
}
