import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class SchoolProfileUpdatedEvent implements IEvent<{ schoolId: Id }> {
  readonly type = 'school.profile-updated';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { schoolId: Id }) {}
}
