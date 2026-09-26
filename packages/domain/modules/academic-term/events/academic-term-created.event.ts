import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class AcademicTermCreatedEvent implements IEvent<{ termId: Id; schoolId: Id }> {
  readonly type = 'academic-term.created';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { termId: Id; schoolId: Id }) {}
}
