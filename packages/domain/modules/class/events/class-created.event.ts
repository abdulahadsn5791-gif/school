import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ClassCreatedEvent implements IEvent<{ classId: Id; schoolId: Id }> {
  readonly type = 'class.created';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { classId: Id; schoolId: Id }) {}
}
