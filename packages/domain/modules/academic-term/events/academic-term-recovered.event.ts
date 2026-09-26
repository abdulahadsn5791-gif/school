import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class AcademicTermRecoveredEvent implements IEvent<{ termId: Id }> {
  readonly type = 'academic-term.recovered';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { termId: Id }) {}
}
