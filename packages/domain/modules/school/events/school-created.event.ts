import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class SchoolCreatedEvent implements IEvent<{ schoolId: Id; code: string }> {
  readonly type = 'school.created';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { schoolId: Id; code: string }) {}
}
