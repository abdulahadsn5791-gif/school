import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ClassDeletedEvent implements IEvent<{ classId: Id }> {
  readonly type = 'class.deleted';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { classId: Id }) {}
}
