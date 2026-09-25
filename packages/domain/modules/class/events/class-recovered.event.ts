import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ClassRecoveredEvent implements IEvent<{ classId: Id }> {
  readonly type = 'class.recovered';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { classId: Id }) {}
}
